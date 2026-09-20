const db = require("../config/dbConnection");

async function migrateAdvisorsTable() {
  const client = await db.connect();
  
  try {
    console.log("Starting advisors table migration...");
    
    // Check if column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='advisors' AND column_name='user_id'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log("Renaming user_id to university_id...");
      
      // Rename the column
      await client.query(`
        ALTER TABLE public.advisors 
        RENAME COLUMN user_id TO university_id
      `);
      
      console.log("✓ Column renamed successfully!");
    } else {
      console.log("Column user_id not found, checking for university_id...");
      
      const checkUniversityId = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='advisors' AND column_name='university_id'
      `);
      
      if (checkUniversityId.rows.length > 0) {
        console.log("✓ university_id column already exists!");
      } else {
        console.log("Adding university_id column...");
        await client.query(`
          ALTER TABLE public.advisors 
          ADD COLUMN university_id UUID REFERENCES public.users(id) ON DELETE CASCADE
        `);
        console.log("✓ Column added successfully!");
      }
    }
    
    console.log("Migration completed successfully!");
    
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
migrateAdvisorsTable()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
