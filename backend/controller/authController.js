const { v4: uuidv4 } = require("uuid")
const User = require("../models/userModel")
const hashUtils = require("../utils/hash")
const tokenUtils = require("../utils/token")
const emailService = require("../utils/emailService")

/**
 * Check if email verification is required
 * This reads from admin settings (stored in localStorage on frontend)
 * For now, we'll check an environment variable
 */
const isEmailVerificationRequired = () => {
  // Check environment variable - handle both 'true' and 'True'
  const envValue = process.env.REQUIRE_EMAIL_VERIFICATION;
  return envValue && envValue.toLowerCase() === 'true';
};

/**
 * Register user
 */
exports.register = async (req, res) => {
  const { email, password, role, organization_name } = req.body

  if (!email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" })
  }

  // SECURITY: Prevent admin role creation via public signup
  // Admin accounts must be created via secure script only
  if (role === "admin") {
    console.warn(`[SECURITY] Attempted admin signup blocked: ${email}`);
    return res.status(403).json({ 
      message: "Admin accounts cannot be created through public signup. Please contact system administrator." 
    })
  }

  // Validate role
  const allowedRoles = ["company", "university", "student"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ 
      message: "Invalid role. Allowed roles: company, university, student" 
    })
  }

  // Require organization name for university and company roles
  if ((role === "university" || role === "company") && !organization_name?.trim()) {
    return res.status(400).json({ message: `${role === "university" ? "University" : "Company"} name is required` })
  }

  try {
    const userExists = await User.findByEmail(email)
    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashedPassword = await hashUtils.hashPassword(password)

    // Generate verification token if email verification is required
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await User.createUser({
      id: uuidv4(),
      email,
      password: hashedPassword,
      role,
      organization_name: organization_name?.trim() || null,
      verification_token: verificationToken,
      verification_token_expires: verificationExpires,
    })

    // Send verification email
    const requireVerification = isEmailVerificationRequired();
    if (requireVerification) {
      await emailService.sendVerificationEmail(
        email, 
        verificationToken, 
        organization_name || email
      );
    }

    const token = tokenUtils.generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      organization_name: newUser.organization_name,
    })

    return res.status(201).json({
      message: requireVerification 
        ? "User registered successfully. Please check your email to verify your account." 
        : "User registered successfully",
      token,
      requiresVerification: requireVerification,
      emailVerified: !requireVerification, // If not required, treat as verified
    })
  } catch (error) {
    console.error("REGISTER ERROR:", error)
    return res.status(500).json({ message: "Server error" })
  }
}

/**
 * Verify email
 */
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Verification token is required" });
  }

  try {
    const user = await User.findByVerificationToken(token);

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    // Check if token is expired
    if (user.verification_token_expires && new Date() > new Date(user.verification_token_expires)) {
      return res.status(400).json({ message: "Verification token has expired. Please request a new one." });
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(200).json({ message: "Email already verified", alreadyVerified: true });
    }

    // Verify the email
    await User.verifyEmail(user.id);

    return res.status(200).json({ 
      message: "Email verified successfully! You can now log in.",
      success: true 
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Resend verification email
 */
exports.resendVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({ message: "If the email exists, a verification link has been sent." });
    }

    if (user.email_verified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new verification token
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await User.updateVerificationToken(user.id, verificationToken, verificationExpires);

    // Send verification email
    await emailService.sendVerificationEmail(
      email, 
      verificationToken, 
      user.organization_name || email
    );

    return res.status(200).json({ 
      message: "Verification email sent successfully. Please check your inbox.",
      success: true 
    });
  } catch (error) {
    console.error("RESEND VERIFICATION ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  const { email, password } = req.body

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" })
  }

  try {
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Compare password
    const passwordMatch = await hashUtils.comparePassword(
      password,
      user.password
    )
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check if email verification is required and if user is verified
    const requireVerification = isEmailVerificationRequired();
    if (requireVerification && !user.email_verified) {
      return res.status(403).json({ 
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate JWT token
    const token = tokenUtils.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return res.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.email_verified
      }
    })
  } catch (error) {
    console.error("LOGIN ERROR:", error)
    return res.status(500).json({ message: "Server error" })
  }
}

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
  const { userId, newPassword } = req.body

  if (!userId || !newPassword) {
    return res.status(400).json({ message: "Missing data" })
  }

  try {
    const hashedPassword = await hashUtils.hashPassword(newPassword)
    await User.updatePassword(userId, hashedPassword)

    return res.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
