const db = require("../config/dbConnection");

async function addUserStatusColumn() {
  try {
    console.log("🔧 Adding status column to users table...");

    // Check if status column exists
    const checkColumn = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='status'
    `);

    if (checkColumn.rows.length > 0) {
      console.log("✅ Status column already exists");
      return;
    }

    // Add status column with default value 'active'
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
    `);

    // Add constraint to ensure only valid statuses
    await db.query(`
      ALTER TABLE users 
      ADD CONSTRAINT check_status 
      CHECK (status IN ('active', 'suspended'))
    `);

    // Add updated_at column if it doesn't exist
    const checkUpdatedAt = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='updated_at'
    `);

    if (checkUpdatedAt.rows.length === 0) {
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log("✅ Added updated_at column");
    }

    // Set all existing users to 'active' status
    await db.query(`
      UPDATE users 
      SET status = 'active' 
      WHERE status IS NULL
    `);

    console.log("✅ Successfully added status column to users table");
    console.log("✅ All existing users set to 'active' status");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding status column:", error);
    process.exit(1);
  }
}

addUserStatusColumn();
