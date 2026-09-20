// Script to create an admin user
// Run: node createAdminUser.js

require("dotenv").config();
const db = require("./config/dbConnection");
const bcrypt = require("bcrypt");  // Changed from bcryptjs to bcrypt
const { v4: uuidv4 } = require("uuid");

async function createAdminUser() {
  try {
    console.log("🔐 Creating Admin User...\n");

    // Admin credentials
    const adminData = {
      id: uuidv4(),
      email: "admin@internhub.com",
      password: "Admin@123456", // Change this after first login!
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
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email:    ${adminData.email}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log(`🏢 Organization: ${adminData.organization_name}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("🌐 Access Admin Dashboard:");
    console.log("1. Go to: http://localhost:3000/auth/login");
    console.log(`2. Login with email: ${adminData.email}`);
    console.log(`3. Password: ${adminData.password}`);
    console.log("4. You'll be redirected to: /dashboard/admin\n");

    console.log("⚠️  IMPORTANT SECURITY NOTES:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. Change the default password immediately after first login!");
    console.log("2. Use a strong password (min 8 chars, uppercase, lowercase, number, special char)");
    console.log("3. Never share admin credentials");
    console.log("4. Enable 2FA if available\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
}

createAdminUser();
