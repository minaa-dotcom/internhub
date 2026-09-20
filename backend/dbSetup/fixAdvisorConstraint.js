const db = require("../config/dbConnection");

async function fixAdvisorConstraint() {
  const client = await db.connect();
  
  try {
    console.log("Fixing advisors table foreign key constraint...\n");
    
    // Step 1: Drop the old constraint
    console.log("1. Dropping old foreign key constraint...");
    await client.query(`
      ALTER TABLE public.advisors 
      DROP CONSTRAINT IF EXISTS advisors_user_id_fkey
    `);
    console.log("✓ Old constraint dropped\n");
    
    // Step 2: Add new constraint with correct name
    console.log("2. Adding new foreign key constraint...");
    await client.query(`
      ALTER TABLE public.advisors 
      ADD CONSTRAINT advisors_university_id_fkey 
      FOREIGN KEY (university_id) 
      REFERENCES public.users(id) 
      ON DELETE CASCADE
    `);
    console.log("✓ New constraint added\n");
    
    // Step 3: Verify the constraint
    console.log("3. Verifying constraint...");
    const constraintCheck = await client.query(`
      SELECT constraint_name, column_name
      FROM information_schema.key_column_usage
      WHERE table_name = 'advisors' 
      AND constraint_name LIKE '%university_id%'
    `);
    
    if (constraintCheck.rows.length > 0) {
      console.log("✓ Constraint verified:");
      constraintCheck.rows.forEach(row => {
        console.log(`  - ${row.constraint_name} on ${row.column_name}`);
      });
    }
    
    console.log("\n=================================");
    console.log("Constraint fix completed! ✓");
    console.log("=================================");
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    console.error("Stack:", error.stack);
    throw error;
  } finally {
    client.release();
  }
}

// Run fix
fixAdvisorConstraint()
  .then(() => {
    console.log("\nDone! You can now create advisors.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nFailed:", error.message);
    process.exit(1);
  });
