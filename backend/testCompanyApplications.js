/**
 * Test Company Applications Endpoint
 * 
 * This script helps test the company applications endpoint
 * Usage: node testCompanyApplications.js
 */

require('dotenv').config();
const db = require('./config/dbConnection');

async function testCompanyApplications() {
  console.log('🧪 Testing Company Applications Setup...\n');

  try {
    // 1. Check if companyapplications table exists
    console.log('1️⃣ Checking if companyapplications table exists...');
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'companyapplications'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ companyapplications table exists\n');
    } else {
      console.log('❌ companyapplications table does NOT exist\n');
      console.log('Run: npm run dev (to initialize tables)\n');
      process.exit(1);
    }

    // 2. Check for company users
    console.log('2️⃣ Checking for company users...');
    const companyUsers = await db.query(`
      SELECT id, email, role, organization_name 
      FROM users 
      WHERE role = 'company'
      LIMIT 5
    `);
    
    if (companyUsers.rows.length > 0) {
      console.log(`✅ Found ${companyUsers.rows.length} company user(s):`);
      companyUsers.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.organization_name || 'No name'}) - ID: ${user.id}`);
      });
      console.log('');
    } else {
      console.log('❌ No company users found');
      console.log('Create a company user via signup: http://localhost:3000/auth/signup\n');
    }

    // 3. Check for applications in companyapplications table
    console.log('3️⃣ Checking applications in companyapplications table...');
    const applications = await db.query(`
      SELECT 
        ca.id,
        ca.application_id,
        ca.company_id,
        ca.first_name || ' ' || ca.last_name as student_name,
        ca.status,
        ca.created_at,
        u.organization_name as company_name
      FROM companyapplications ca
      LEFT JOIN users u ON ca.company_id = u.id
      ORDER BY ca.created_at DESC
      LIMIT 5
    `);
    
    if (applications.rows.length > 0) {
      console.log(`✅ Found ${applications.rows.length} application(s):`);
      applications.rows.forEach(app => {
        console.log(`   - ${app.student_name} → ${app.company_name || 'Unknown Company'}`);
        console.log(`     Status: ${app.status}, Company ID: ${app.company_id}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No applications found in companyapplications table');
      console.log('Applications will appear here when universities submit them\n');
    }

    // 4. Count applications per company
    console.log('4️⃣ Applications count per company...');
    const stats = await db.query(`
      SELECT 
        ca.company_id,
        u.organization_name,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE ca.status = 'pending') as pending,
        COUNT(*) FILTER (WHERE ca.status = 'under_review') as under_review,
        COUNT(*) FILTER (WHERE ca.status = 'accepted') as accepted,
        COUNT(*) FILTER (WHERE ca.status = 'rejected') as rejected
      FROM companyapplications ca
      LEFT JOIN users u ON ca.company_id = u.id
      GROUP BY ca.company_id, u.organization_name
    `);
    
    if (stats.rows.length > 0) {
      console.log('✅ Statistics per company:');
      stats.rows.forEach(stat => {
        console.log(`   ${stat.organization_name || 'Unknown Company'}:`);
        console.log(`   Total: ${stat.total}, Pending: ${stat.pending}, Under Review: ${stat.under_review}`);
        console.log(`   Accepted: ${stat.accepted}, Rejected: ${stat.rejected}\n`);
      });
    } else {
      console.log('⚠️  No statistics available (no applications yet)\n');
    }

    // 5. Test query that the API uses
    if (companyUsers.rows.length > 0) {
      const testCompanyId = companyUsers.rows[0].id;
      console.log(`5️⃣ Testing API query for company: ${companyUsers.rows[0].email}...`);
      
      const apiTestQuery = await db.query(`
        SELECT * FROM companyapplications 
        WHERE company_id = $1 
        ORDER BY created_at DESC 
        LIMIT 10 OFFSET 0
      `, [testCompanyId]);
      
      console.log(`✅ API query returned ${apiTestQuery.rows.length} result(s)`);
      
      if (apiTestQuery.rows.length > 0) {
        console.log('   Sample application:');
        const sample = apiTestQuery.rows[0];
        console.log(`   - Student: ${sample.first_name} ${sample.last_name}`);
        console.log(`   - Email: ${sample.email}`);
        console.log(`   - Status: ${sample.status}`);
        console.log(`   - Department: ${sample.department}`);
      }
      console.log('');
    }

    console.log('✅ All tests completed successfully!\n');
    console.log('📋 Next Steps:');
    console.log('1. Ensure backend is running: npm run dev');
    console.log('2. Ensure frontend is running: cd frontend/internhub && npm run dev');
    console.log('3. Login as a company user at: http://localhost:3000/auth/login');
    console.log('4. Navigate to applications page and check browser console\n');

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
testCompanyApplications();
