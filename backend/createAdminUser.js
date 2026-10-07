// Script to create an admin user with strong password
// Run: node createAdminUser.js

require("dotenv").config();
const db = require("./config/dbConnection");
const bcrypt = require("bcrypt");  // Changed from bcryptjs to bcrypt
const { v4: uuidv4 } = require("uuid");

// Generate a strong random password that meets requirements:
// - Minimum 8 characters
// - At least 1 uppercase letter
// - At least 1 lowercase letter
// - At least 1 number
// - At least 1 special character
function generateStrongPassword() {
  const length = 12;
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  
  // Ensure at least one of each required character type
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest with random characters from all sets
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to avoid predictable pattern
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function createAdminUser() {
  try {
    console.log("🔐 Creating Admin User with Strong Password...\n");

    // Generate strong password
    const strongPassword = generateStrongPassword();

    // Admin credentials
    const adminData = {
      id: uuidv4(),
      email: "admin@internhub.com",
      password: strongPassword, // Strong auto-generated password
      organization_name: "InternHub Admin",
      role: "admin"
    };

    // Check if admin already exists
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [adminData.email]
    );

    if (existingUser.rows.length > 0) {
      console.log("⚠️  Admin user already exists!");
      console.log(`📧 Email: ${adminData.email}`);
      console.log("\n💡 To update password, use SQL or create a new admin with different email\n");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Insert admin user
    const result = await db.query(
      `INSERT INTO users (id, email, password, organization_name, role, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, email, organization_name, role`,
      [
        adminData.id,
        adminData.email,
        hashedPassword,
        adminData.organization_name,
        adminData.role
      ]
    );

    console.log("✅ Admin user created successfully!\n");
    console.log("📋 Admin Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email:        ${adminData.email}`);
    console.log(`🔑 Password:     ${adminData.password}`);
    console.log(`🏢 Organization: ${adminData.organization_name}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("✅ Password Requirements Met:");
    console.log("  ✓ 12 characters (exceeds 8 minimum)");
    console.log("  ✓ Contains uppercase letters (A-Z)");
    console.log("  ✓ Contains lowercase letters (a-z)");
    console.log("  ✓ Contains numbers (0-9)");
    console.log("  ✓ Contains special characters (!@#$%^&*)\n");
    
    console.log("🌐 Access Admin Dashboard:");
    console.log("1. Go to: http://localhost:3000/auth/login");
    console.log(`2. Login with email: ${adminData.email}`);
    console.log(`3. Password: ${adminData.password}`);
    console.log("4. You'll be redirected to: /dashboard/admin\n");

    console.log("⚠️  IMPORTANT SECURITY NOTES:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. ⚠️  SAVE THIS PASSWORD NOW! It won't be shown again!");
    console.log("2. ✅ Password is strong and meets all validation requirements");
    console.log("3. 🔒 Consider changing it after first login to something memorable");
    console.log("4. 🚫 Never share admin credentials");
    console.log("5. 📝 Store password securely (password manager recommended)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
}

createAdminUser();
