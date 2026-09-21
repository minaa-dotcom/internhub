require('dotenv').config();
const db = require("./config/dbConnection");

async function testUsersQuery() {
  try {
    console.log("🔍 Testing users query...\n");

    // Check if users table exists
    const tableCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'users'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log("❌ Users table doesn't exist!");
      process.exit(1);
    }
    console.log("✅ Users table exists\n");

    // Check columns in users table
    console.log("📋 Columns in users table:");
    const columns = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    console.log("");

    // Count total users
    const countResult = await db.query("SELECT COUNT(*) FROM users");
    console.log(`👥 Total users in database: ${countResult.rows[0].count}\n`);

    // Get all users with the exact query from controller
    const users = await db.query(`
      SELECT 
        u.id, 
        u.email, 
        u.role, 
        u.status,
        u.created_at,
        CASE 
          WHEN u.role = 'student' THEN (SELECT university_name FROM students WHERE user_id = u.id)
          WHEN u.role = 'company' THEN (SELECT company_name FROM companies WHERE user_id = u.id)
          WHEN u.role = 'university' THEN (SELECT university_name FROM universities WHERE user_id = u.id)
          ELSE NULL
        END as organization_name
      FROM users u
      ORDER BY u.created_at DESC
      LIMIT 10
    `);

    if (users.rows.length === 0) {
      console.log("⚠️  No users found with query!");
    } else {
      console.log(`✅ Found ${users.rows.length} users:\n`);
      users.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status || 'NULL'}`);
        console.log(`   Organization: ${user.organization_name || 'None'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log("");
      });
    }

    // Check if status column exists
    const statusCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'status'
    `);
    
    if (statusCheck.rows.length === 0) {
      console.log("❌ Status column doesn't exist! Run: node dbSetup/addUserStatusColumn.js");
    } else {
      console.log("✅ Status column exists");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

testUsersQuery();
