// Test admin access and endpoints
// Run: node testAdminAccess.js

require("dotenv").config();
const db = require("./config/dbConnection");

async function testAdminAccess() {
  try {
    console.log("🔍 Testing Admin Access...\n");

    // Test 1: Check if admin user exists
    console.log("Test 1: Checking for admin users...");
    const adminCheck = await db.query(
      "SELECT id, email, role, organization_name FROM users WHERE role = 'admin'"
    );

    if (adminCheck.rows.length === 0) {
      console.log("❌ No admin users found!");
      console.log("💡 Run: node createAdminUser.js\n");
      process.exit(1);
    }

    console.log(`✅ Found ${adminCheck.rows.length} admin user(s):`);
    adminCheck.rows.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} (${admin.organization_name || 'N/A'})`);
    });
    console.log();

    // Test 2: Check if stats query works
    console.log("Test 2: Testing stats query...");
    try {
      const stats = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM users WHERE role = 'company') as companies,
          (SELECT COUNT(*) FROM users WHERE role = 'university') as universities,
          (SELECT COUNT(*) FROM users WHERE role = 'student') as students,
          (SELECT COUNT(*) FROM mentors) as mentors,
          (SELECT COUNT(*) FROM advisors) as advisors,
          (SELECT COUNT(*) FROM universityapplications) as applications
      `);

      console.log("✅ Stats query successful!");
      console.log("📊 Current Stats:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      const statsData = stats.rows[0];
      console.log(`   Total Users:    ${statsData.total_users}`);
      console.log(`   Companies:      ${statsData.companies}`);
      console.log(`   Universities:   ${statsData.universities}`);
      console.log(`   Students:       ${statsData.students}`);
      console.log(`   Mentors:        ${statsData.mentors}`);
      console.log(`   Advisors:       ${statsData.advisors}`);
      console.log(`   Applications:   ${statsData.applications}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    } catch (error) {
      console.log("❌ Stats query failed:", error.message);
      console.log("💡 Some tables might be missing\n");
    }

    // Test 3: List all users by role
    console.log("Test 3: User distribution by role...");
    const roleStats = await db.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY count DESC
    `);

    console.log("✅ User roles:");
    roleStats.rows.forEach(row => {
      console.log(`   ${row.role}: ${row.count}`);
    });
    console.log();

    // Test 4: Backend route check
    console.log("Test 4: Backend endpoint check...");
    console.log("📡 Admin endpoint should be at:");
    console.log("   http://localhost:5000/api/secure/management/stats");
    console.log();
    console.log("💡 Make sure backend is running:");
    console.log("   cd backend");
    console.log("   npm run dev");
    console.log();

    // Summary
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 All tests passed!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("📋 Next Steps:");
    console.log("1. Make sure backend is running (npm run dev)");
    console.log("2. Go to: http://localhost:3000/auth/login");
    console.log(`3. Login with: ${adminCheck.rows[0].email}`);
    console.log("4. Password: Admin@123456 (if you used createAdminUser.js)");
    console.log("5. You should see the admin dashboard!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("\n💡 Possible issues:");
    console.error("   - Database not running");
    console.error("   - Database not initialized (run backend first)");
    console.error("   - Connection settings wrong in .env\n");
    process.exit(1);
  }
}

testAdminAccess();
