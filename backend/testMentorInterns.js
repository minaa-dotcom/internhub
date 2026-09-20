const db = require("./config/dbConnection");

async function testMentorInterns() {
  try {
    console.log("Testing mentor assignments...\n");
    
    // Test 1: Database connection
    console.log("1. Testing database connection...");
    await db.query('SELECT 1');
    console.log("✓ Database connected\n");
    
    // Test 2: Check if mentor_assignments table exists
    console.log("2. Checking if mentor_assignments table exists...");
    const tableCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'mentor_assignments'
    `);
    if (tableCheck.rows.length > 0) {
      console.log("✓ mentor_assignments table exists\n");
    } else {
      console.log("✗ mentor_assignments table does NOT exist\n");
      console.log("The table needs to be created first.");
      return;
    }
    
    // Test 3: Check mentors table
    console.log("3. Checking mentors...");
    const mentorsQuery = await db.query(`
      SELECT id, first_name, last_name, email, company_id
      FROM public.mentors
      ORDER BY created_at DESC
      LIMIT 5
    `);
    console.log(`✓ Found ${mentorsQuery.rows.length} mentor(s)\n`);
    
    if (mentorsQuery.rows.length > 0) {
      console.log("Sample mentors:");
      mentorsQuery.rows.forEach((mentor, index) => {
        console.log(`${index + 1}. ${mentor.first_name} ${mentor.last_name} (${mentor.email})`);
        console.log(`   ID: ${mentor.id}`);
      });
      console.log();
    }
    
    // Test 4: Query all assigned interns
    console.log("4. Querying all assigned interns...");
    const query = `
      SELECT 
        ma.*,
        m.first_name as mentor_first_name,
        m.last_name as mentor_last_name
      FROM public.mentor_assignments ma
      LEFT JOIN public.mentors m ON ma.mentor_id = m.id
      ORDER BY ma.assigned_date DESC
      LIMIT 10
    `;
    
    const result = await db.query(query);
    console.log(`✓ Found ${result.rows.length} assigned intern(s)\n`);
    
    if (result.rows.length > 0) {
      console.log("Sample intern assignments:");
      result.rows.forEach((intern, index) => {
        console.log(`\n${index + 1}. ${intern.student_name}`);
        console.log(`   Email: ${intern.student_email}`);
        console.log(`   Mentor: ${intern.mentor_first_name} ${intern.mentor_last_name}`);
        console.log(`   Mentor ID: ${intern.mentor_id}`);
        console.log(`   Assigned: ${intern.assigned_date}`);
        console.log(`   Status: ${intern.status || 'active'}`);
      });
    } else {
      console.log("No interns assigned yet.");
      console.log("Assign interns from the Mentors Management page first.");
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

testMentorInterns();
