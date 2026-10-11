require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require("../config/dbConnection");

/**
 * Add email verification columns to users table
 */
async function addEmailVerificationColumns() {
  try {
    console.log("Adding email verification columns to users table...");

    // Add email_verified column
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false
    `);
    console.log("✓ Added email_verified column");

    // Add verification_token column
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) DEFAULT NULL
    `);
    console.log("✓ Added verification_token column");

    // Add verification_token_expires column
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP DEFAULT NULL
    `);
    console.log("✓ Added verification_token_expires column");

    // Set existing users as verified (so they don't get locked out)
    const result = await db.query(`
      UPDATE users 
      SET email_verified = true 
      WHERE email_verified IS NULL OR email_verified = false
    `);
    console.log(`✓ Set ${result.rowCount} existing users as verified`);

    console.log("\n✅ Email verification columns added successfully!");
    console.log("\nNew columns:");
    console.log("  - email_verified (BOOLEAN, default: false)");
    console.log("  - verification_token (VARCHAR(255))");
    console.log("  - verification_token_expires (TIMESTAMP)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding email verification columns:", error);
    process.exit(1);
  }
}

addEmailVerificationColumns();
