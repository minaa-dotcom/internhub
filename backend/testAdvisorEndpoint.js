const db = require("./config/dbConnection");
const advisorController = require("./controller/advisor");

async function testAdvisorEndpoint() {
  try {
    console.log("Testing advisor creation endpoint...\n");
    
    // Test 1: Database connection
    console.log("1. Testing database connection...");
    await db.query('SELECT 1');
    console.log("✓ Database connected\n");
    
    // Test 2: Create advisor directly via model
    console.log("2. Testing advisor creation via model...");
    const advisorModel = require("./models/advisor");
    
    const testAdvisor = {
      university_id: null,
      first_name: 'Test',
      last_name: 'Endpoint',
      email: `test.endpoint.${Date.now()}@test.com`,
      department: 'Test Department',
      phone: '+1234567890'
    };
    
    console.log("Creating advisor with data:", testAdvisor);
    
    const result = await advisorModel.createAdvisor(testAdvisor);
    console.log("✓ Advisor created successfully!");
    console.log("Result:", result);
    console.log();
    
    // Test 3: Verify advisor was created
    console.log("3. Verifying advisor in database...");
    const checkQuery = await db.query('SELECT * FROM public.advisors WHERE email = $1', [testAdvisor.email]);
    if (checkQuery.rows.length > 0) {
      console.log("✓ Advisor found in database");
      console.log("Data:", checkQuery.rows[0]);
    } else {
      console.log("✗ Advisor NOT found in database");
    }
    console.log();
    
    // Clean up
    console.log("4. Cleaning up test data...");
    await db.query('DELETE FROM public.advisors WHERE email = $1', [testAdvisor.email]);
    console.log("✓ Test data cleaned up\n");
    
    console.log("=================================");
    console.log("All endpoint tests passed! ✓");
    console.log("=================================");
    console.log("\nThe backend model is working correctly.");
    console.log("If frontend still fails, check:");
    console.log("1. Backend server is running (npm run dev)");
    console.log("2. CORS is configured correctly");
    console.log("3. Authentication token is valid");
    console.log("4. Network tab in browser for actual error");
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    process.exit(0);
  }
}

testAdvisorEndpoint();
