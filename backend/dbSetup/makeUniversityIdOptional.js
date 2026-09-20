const db = require("../config/dbConnection");

async function makeUniversityIdOptional() {
  const client = await db.connect();
  
  try {
    console.log("Making university_id optional in advisors table...\n");
    
    // Step 1: Drop the existing constraint
    console.log("1. Dropping existing foreign key constraint...");
    await client.query(`
      ALTER TABLE public.advisors 
      DROP CONSTRAINT IF EXISTS advisors_university_id_fkey
    `);
    console.log("✓ Constraint dropped\n");
    
    // Step 2: Add new constraint with ON DELETE SET NULL (allows NULL values)
    console.log("2. Adding new constraint (allows NULL)...");
    await client.query(`
      ALTER TABLE public.advisors 
      ADD CONSTRAINT advisors_university_id_fkey 
      FOREIGN KEY (university_id) 
      REFERENCES public.users(id) 
      ON DELETE SET NULL
    `);
    console.log("✓ New constraint added (university_id can be NULL)\n");
    
    // Step 3: Verify
    console.log("3. Verifying changes...");
    const check = await client.query(`
      SELECT 
        column_name, 
        is_nullable,
        data_type
      FROM information_schema.columns
      WHERE table_name = 'advisors' 
      AND column_name = 'university_id'
    `);
    
    if (check.rows.length > 0) {
      const col = check.rows[0];
      console.log(`✓ Column: ${col.column_name}`);
      console.log(`  Type: ${col.data_type}`);
      console.log(`  Nullable: ${col.is_nullable}`);
    }
    
    console.log("\n=================================");
    console.log("Update completed! ✓");
    console.log("university_id is now optional");
    console.log("=================================");
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

makeUniversityIdOptional()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nFailed:", error.message);
    process.exit(1);
  });
