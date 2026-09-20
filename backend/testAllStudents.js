const db = require("./config/dbConnection");

async function testAllStudents() {
  try {
    console.log("Testing all assigned students endpoint...\n");
    
    // Test 1: Database connection
    console.log("1. Testing database connection...");
    await db.query('SELECT 1');
    console.log("✓ Database connected\n");
    
    // Test 2: Check if student_assignments table exists
    console.log("2. Checking if student_assignments table exists...");
    const tableCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'student_assignments'
    `);
    if (tableCheck.rows.length > 0) {
      console.log("✓ student_assignments table exists\n");
    } else {
      console.log("✗ student_assignments table does NOT exist\n");
      return;
    }
    
    // Test 3: Query all assigned students
    console.log("3. Querying all assigned students...");
    const query = `
      SELECT 
        sa.*,
        a.first_name as advisor_first_name,
        a.last_name as advisor_last_name
      FROM public.student_assignments sa
      LEFT JOIN public.advisors a ON sa.advisor_id = a.id
      WHERE sa.status = 'active'
      ORDER BY sa.assigned_date DESC
      LIMIT 10
    `;
    
    const result = await db.query(query);
    console.log(`✓ Found ${result.rows.length} assigned student(s)\n`);
    
    if (result.rows.length > 0) {
      console.log("Sample student data:");
      result.rows.forEach((student, index) => {
        console.log(`\n${index + 1}. ${student.student_name}`);
        console.log(`   Email: ${student.student_email}`);
        console.log(`   Department: ${student.department}`);
        console.log(`   Advisor: ${student.advisor_first_name} ${student.advisor_last_name}`);
        console.log(`   Assigned: ${student.assigned_date}`);
      });
    } else {
      console.log("No students assigned yet.");
      console.log("Assign students from the Advisors Management page first.");
    }
    
    console.log("\n=================================");
    console.log("Test completed! ✓");
    console.log("=================================");
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    process.exit(0);
  }
}

testAllStudents();
