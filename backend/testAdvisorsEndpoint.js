/**
 * Test Advisors Endpoint
 * 
 * This script helps test the advisors endpoint
 * Usage: node testAdvisorsEndpoint.js
 */

require('dotenv').config();
const db = require('./config/dbConnection');

async function testAdvisorsEndpoint() {
  console.log('🧪 Testing Advisors Endpoint Setup...\n');

  try {
    // 1. Check if advisors table exists
    console.log('1️⃣ Checking if advisors table exists...');
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'advisors'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ advisors table exists\n');
    } else {
      console.log('❌ advisors table does NOT exist\n');
      console.log('Run: npm run dev (to initialize tables)\n');
      process.exit(1);
    }

    // 2. Check for university users
    console.log('2️⃣ Checking for university users...');
    const universityUsers = await db.query(`
      SELECT id, email, role, organization_name 
      FROM users 
      WHERE role = 'university'
      LIMIT 5
    `);
    
    if (universityUsers.rows.length > 0) {
      console.log(`✅ Found ${universityUsers.rows.length} university user(s):`);
      universityUsers.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.organization_name || 'No name'}) - ID: ${user.id}`);
      });
      console.log('');
    } else {
      console.log('❌ No university users found');
      console.log('Create a university user via signup: http://localhost:3000/auth/signup\n');
    }

    // 3. Check for advisors
    console.log('3️⃣ Checking advisors in database...');
    const advisors = await db.query(`
      SELECT 
        a.id,
        a.first_name,
        a.last_name,
        a.email,
        a.department,
        a.phone,
        a.university_id,
        u.organization_name as university_name,
        COUNT(sa.id) as assigned_students_count
      FROM advisors a
      LEFT JOIN users u ON a.university_id = u.id
      LEFT JOIN student_assignments sa ON sa.advisor_id = a.id AND sa.status = 'active'
      GROUP BY a.id, u.organization_name
      ORDER BY a.created_at DESC
      LIMIT 10
    `);
    
    if (advisors.rows.length > 0) {
      console.log(`✅ Found ${advisors.rows.length} advisor(s):`);
      advisors.rows.forEach(advisor => {
        console.log(`   - ${advisor.first_name} ${advisor.last_name} (${advisor.email})`);
        console.log(`     Department: ${advisor.department || 'N/A'}`);
        console.log(`     University: ${advisor.university_name || 'Unknown'}`);
        console.log(`     Assigned Students: ${advisor.assigned_students_count}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No advisors found in database');
      console.log('Create advisors via the Advisors Management page\n');
    }

    // 4. Check student assignments
    console.log('4️⃣ Checking student assignments...');
    const assignments = await db.query(`
      SELECT 
        sa.id,
        sa.student_name,
        sa.student_email,
        sa.department,
        sa.company_name,
        sa.status,
        a.first_name || ' ' || a.last_name as advisor_name,
        a.email as advisor_email
      FROM student_assignments sa
      LEFT JOIN advisors a ON sa.advisor_id = a.id
      WHERE sa.status = 'active'
      ORDER BY sa.assigned_date DESC
      LIMIT 10
    `);
    
    if (assignments.rows.length > 0) {
      console.log(`✅ Found ${assignments.rows.length} active assignment(s):`);
      assignments.rows.forEach(assignment => {
        console.log(`   - Student: ${assignment.student_name} (${assignment.student_email})`);
        console.log(`     Advisor: ${assignment.advisor_name} (${assignment.advisor_email})`);
        console.log(`     Company: ${assignment.company_name || 'N/A'}`);
        console.log(`     Department: ${assignment.department}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No active student assignments found\n');
    }

    // 5. Check accepted applications (available for assignment)
    console.log('5️⃣ Checking accepted applications (available for assignment)...');
    const acceptedApps = await db.query(`
      SELECT 
        ua.id,
        ua.application_id,
        ua.first_name || ' ' || ua.last_name as student_name,
        ua.email,
        ua.department,
        ua.status,
        CASE 
          WHEN sa.id IS NOT NULL THEN true
          ELSE false
        END as is_assigned
      FROM universityapplications ua
      LEFT JOIN student_assignments sa ON sa.application_id = ua.id
      WHERE ua.status = 'accepted'
      ORDER BY ua.created_at DESC
      LIMIT 10
    `);
    
    if (acceptedApps.rows.length > 0) {
      const unassigned = acceptedApps.rows.filter(app => !app.is_assigned);
      console.log(`✅ Found ${acceptedApps.rows.length} accepted application(s):`);
      console.log(`   Unassigned: ${unassigned.length}`);
      console.log(`   Assigned: ${acceptedApps.rows.length - unassigned.length}`);
      
      if (unassigned.length > 0) {
        console.log('\n   Unassigned students:');
        unassigned.forEach(app => {
          console.log(`   - ${app.student_name} (${app.email}) - ${app.department}`);
        });
      }
      console.log('');
    } else {
      console.log('⚠️  No accepted applications found');
      console.log('Students must be accepted first before they can be assigned to advisors\n');
    }

    // 6. Test query that the API uses (if university users exist)
    if (universityUsers.rows.length > 0) {
      const testUniversityId = universityUsers.rows[0].id;
      console.log(`6️⃣ Testing API query for university: ${universityUsers.rows[0].email}...`);
      
      const apiTestQuery = await db.query(`
        SELECT * FROM advisors 
        WHERE university_id = $1 
        ORDER BY created_at DESC
      `, [testUniversityId]);
      
      console.log(`✅ API query returned ${apiTestQuery.rows.length} advisor(s) for this university`);
      
      if (apiTestQuery.rows.length > 0) {
        console.log('   Sample advisor:');
        const sample = apiTestQuery.rows[0];
        console.log(`   - Name: ${sample.first_name} ${sample.last_name}`);
        console.log(`   - Email: ${sample.email}`);
        console.log(`   - Department: ${sample.department}`);
      }
      console.log('');
    }

    // 7. Check related tables
    console.log('7️⃣ Checking related tables...');
    const relatedTables = ['student_progress', 'student_attendance', 'student_evaluations', 'student_reports'];
    
    for (const table of relatedTables) {
      const count = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`   ${table}: ${count.rows[0].count} record(s)`);
    }
    console.log('');

    console.log('✅ All tests completed successfully!\n');
    console.log('📋 Next Steps:');
    console.log('1. Ensure backend is running: npm run dev');
    console.log('2. Ensure frontend is running: cd frontend/internhub && npm run dev');
    console.log('3. Login as a university user at: http://localhost:3000/auth/login');
    console.log('4. Navigate to advisors page and check browser console');
    console.log('5. Create advisors and assign accepted students\n');

  } catch (error) {
    console.error('❌ Error during testing:', error);
    console.error('\nStack trace:', error.stack);
  } finally {
    // Close database connection
    await db.end();
    console.log('Database connection closed.');
  }
}

// Run the test
testAdvisorsEndpoint();
