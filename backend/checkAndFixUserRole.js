/**
 * Check and Fix User Role
 * 
 * This script helps identify the current user and fix their role if needed
 * Usage: node checkAndFixUserRole.js
 */

require('dotenv').config();
const db = require('./config/dbConnection');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function checkAndFixUserRole() {
  console.log('🔍 User Role Checker & Fixer\n');

  try {
    // 1. Show all users
    console.log('1️⃣ Current users in database:\n');
    const users = await db.query(`
      SELECT id, email, role, organization_name, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    if (users.rows.length === 0) {
      console.log('❌ No users found in database!');
      console.log('Please create a user via signup: http://localhost:3000/auth/signup\n');
      rl.close();
      await db.end();
      return;
    }

    console.log('┌─────┬────────────────────────────────┬──────────────┬──────────────────────────┐');
    console.log('│ #   │ Email                          │ Role         │ Organization             │');
    console.log('├─────┼────────────────────────────────┼──────────────┼──────────────────────────┤');
    
    users.rows.forEach((user, index) => {
      const email = user.email.padEnd(30).substring(0, 30);
      const role = user.role.padEnd(12).substring(0, 12);
      const org = (user.organization_name || 'N/A').padEnd(24).substring(0, 24);
      console.log(`│ ${String(index + 1).padStart(3)} │ ${email} │ ${role} │ ${org} │`);
    });
    
    console.log('└─────┴────────────────────────────────┴──────────────┴──────────────────────────┘\n');

    // 2. Ask which user to update
    const userNumber = await question('Enter user number to check/update (or "q" to quit): ');
    
    if (userNumber.toLowerCase() === 'q') {
      console.log('Exiting...\n');
      rl.close();
      await db.end();
      return;
    }

    const userIndex = parseInt(userNumber) - 1;
    
    if (userIndex < 0 || userIndex >= users.rows.length) {
      console.log('❌ Invalid user number!\n');
      rl.close();
      await db.end();
      return;
    }

    const selectedUser = users.rows[userIndex];
    
    console.log('\n📋 Selected User Details:');
    console.log('────────────────────────────────────────');
    console.log(`Email:        ${selectedUser.email}`);
    console.log(`Current Role: ${selectedUser.role}`);
    console.log(`Organization: ${selectedUser.organization_name || 'N/A'}`);
    console.log(`User ID:      ${selectedUser.id}`);
    console.log('────────────────────────────────────────\n');

    // 3. Show role requirements
    console.log('📚 Role Requirements:');
    console.log('  • university → Can access Advisors, Students, Applications');
    console.log('  • company    → Can access Applications, Internship Posts');
    console.log('  • student    → Can view available internships');
    console.log('  • admin      → Full access to all features\n');

    // 4. Ask for new role
    console.log(`Current role: ${selectedUser.role}`);
    const newRole = await question('Enter new role (university/company/student/admin) or press Enter to keep current: ');
    
    if (!newRole || newRole.trim() === '') {
      console.log('✅ No changes made.\n');
      rl.close();
      await db.end();
      return;
    }

    const validRoles = ['university', 'company', 'student', 'admin'];
    const roleLower = newRole.toLowerCase().trim();
    
    if (!validRoles.includes(roleLower)) {
      console.log(`❌ Invalid role! Must be one of: ${validRoles.join(', ')}\n`);
      rl.close();
      await db.end();
      return;
    }

    // 5. Confirm update
    const confirm = await question(`\n⚠️  Update ${selectedUser.email} role from "${selectedUser.role}" to "${roleLower}"? (yes/no): `);
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Update cancelled.\n');
      rl.close();
      await db.end();
      return;
    }

    // 6. Update the role
    await db.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
      [roleLower, selectedUser.id]
    );

    console.log('\n✅ Role updated successfully!\n');
    
    // 7. Show updated user
    const updatedUser = await db.query(
      'SELECT id, email, role, organization_name FROM users WHERE id = $1',
      [selectedUser.id]
    );
    
    console.log('📋 Updated User Details:');
    console.log('────────────────────────────────────────');
    console.log(`Email:        ${updatedUser.rows[0].email}`);
    console.log(`New Role:     ${updatedUser.rows[0].role}`);
    console.log(`Organization: ${updatedUser.rows[0].organization_name || 'N/A'}`);
    console.log('────────────────────────────────────────\n');

    console.log('🎉 Next Steps:');
    console.log('1. Logout from the application');
    console.log('2. Login again with the same credentials');
    console.log('3. Your new role will be in the JWT token');
    console.log('4. You should now have access to the appropriate dashboard\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nStack trace:', error.stack);
  } finally {
    rl.close();
    await db.end();
    console.log('Database connection closed.');
  }
}

// Run the script
checkAndFixUserRole();
