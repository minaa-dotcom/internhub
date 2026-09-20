// Script to make an existing user an admin
// Run: node makeUserAdmin.js <email>
// Example: node makeUserAdmin.js user@example.com

require("dotenv").config();
const db = require("./config/dbConnection");

async function makeUserAdmin() {
  try {
    const email = process.argv[2];

    if (!email) {
      console.log("❌ Error: Email is required\n");
      console.log("Usage: node makeUserAdmin.js <email>");
      console.log("Example: node makeUserAdmin.js user@example.com\n");
      process.exit(1);
    }

    console.log(`🔍 Looking for user: ${email}...\n`);

    // Check if user exists
    const userResult = await db.query(
      "SELECT id, email, organization_name, role FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log("❌ User not found!");
      console.log(`📧 No user with email: ${email}\n`);
      console.log("💡 Create user first or check the email spelling.\n");
      process.exit(1);
    }

    const user = userResult.rows[0];

    console.log("✅ User found!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email:         ${user.email}`);
    console.log(`🏢 Organization:  ${user.organization_name || 'N/A'}`);
    console.log(`🎭 Current Role:  ${user.role}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    if (user.role === 'admin') {
      console.log("ℹ️  User is already an admin!\n");
      process.exit(0);
    }

    // Update user to admin
    await db.query(
      "UPDATE users SET role = $1 WHERE id = $2",
      ['admin', user.id]
    );

    console.log("✅ User role updated to ADMIN!\n");
    console.log("📋 Updated User:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email:    ${user.email}`);
    console.log(`🎭 New Role: admin`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🌐 Access Admin Dashboard:");
    console.log("1. Logout if currently logged in");
    console.log("2. Login again with this email");
    console.log("3. You'll be redirected to: /dashboard/admin\n");

    console.log("⚠️  Note: User needs to logout and login again for role change to take effect!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating user:", error.message);
    process.exit(1);
  }
}

makeUserAdmin();
