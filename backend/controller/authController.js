const { v4: uuidv4 } = require("uuid")
const User = require("../models/userModel")
const hashUtils = require("../utils/hash")
const tokenUtils = require("../utils/token")

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

    const newUser = await User.createUser({
      id: uuidv4(),
      email,
      password: hashedPassword,
      role,
      organization_name: organization_name?.trim() || null,
      first_login: false,
    })

    const token = tokenUtils.generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      organization_name: newUser.organization_name,
    })

    return res.status(201).json({
      message: "User registered successfully",
      token,
    })
  } catch (error) {
    console.error("REGISTER ERROR:", error)
    return res.status(500).json({ message: "Server error" })
  }
}

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
        role: user.role
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
