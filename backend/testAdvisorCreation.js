const db = require("./config/dbConnection");

async function testAdvisorCreation() {
  try {
    console.log("Testing advisor creation...\n");
    
    // Test 1: Check database connection
    console.log("1. Testing database connection...");
    await db.query('SELECT 1');
    console.log("✓ Database connected\n");
    
    // Test 2: Check if advisors table exists
    console.log("2. Checking if advisors table exists...");
    const tableCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'advisors'
    `);
    if (tableCheck.rows.length > 0) {
      console.log("✓ Advisors table exists\n");
    } else {
      console.log("✗ Advisors table does NOT exist\n");
      return;
    }
    
    // Test 3: Check table structure
    console.log("3. Checking advisors table structure...");
    const columns = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'advisors'
      ORDER BY ordinal_position
    `);
    console.log("Columns:");
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log();
    
    // Test 4: Check if university_id column exists
    console.log("4. Checking for university_id column...");
    const universityIdCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'advisors' AND column_name = 'university_id'
    `);
    if (universityIdCheck.rows.length > 0) {
      console.log("✓ university_id column exists\n");
    } else {
      console.log("✗ university_id column does NOT exist\n");
      console.log("Run migration: node dbSetup/migrateAdvisorsTable.js\n");
      return;
    }
    
    // Test 5: Try to insert a test advisor with NULL university_id
    console.log("5. Testing advisor insertion with NULL university_id...");
    const testData = {
      university_id: null, // NULL is allowed now
      first_name: 'Test',
      last_name: 'Advisor',
      email: `test.advisor.${Date.now()}@test.com`,
      department: 'Test Department',
      phone: '+1234567890'
    };
    
    console.log("Test data:", testData);
    
    const insertResult = await db.query(`
      INSERT INTO public.advisors (university_id, first_name, last_name, email, department, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      testData.university_id,
      testData.first_name,
      testData.last_name,
      testData.email,
      testData.department,
      testData.phone
    ]);
    
    console.log("✓ Test advisor created successfully!");
    console.log("Created advisor:", insertResult.rows[0]);
    console.log();
    
    // Clean up test data
    console.log("6. Cleaning up test data...");
    await db.query('DELETE FROM public.advisors WHERE email LIKE $1', ['test.advisor.%@test.com']);
    console.log("✓ Test data cleaned up\n");
    
    console.log("=================================");
    console.log("All tests passed! ✓");
    console.log("=================================");
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    process.exit(0);
  }
}

testAdvisorCreation();
