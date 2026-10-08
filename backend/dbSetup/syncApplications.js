const db = require("../config/dbConnection");

/**
 * Application Synchronization Setup
 * 
 * This script creates database triggers to automatically synchronize
 * application status between universityapplications and companyapplications tables.
 * 
 * When a status changes in one table, it automatically updates the other.
 * This ensures both universities and companies always see the current status.
 */

const createSyncTrigger = async () => {
  const client = await db.connect();
  
  try {
    await client.query("BEGIN");
    
    console.log("🔄 Creating application synchronization triggers...");
    
    // Function to sync from universityapplications to companyapplications
    await client.query(`
      CREATE OR REPLACE FUNCTION sync_university_to_company()
      RETURNS TRIGGER AS $$
      BEGIN
        -- If status changed, sync to company table
        IF NEW.status IS DISTINCT FROM OLD.status THEN
          UPDATE companyapplications
          SET 
            status = NEW.status,
            updated_at = NOW()
          WHERE application_id = NEW.application_id;
          
          -- Log the sync for debugging
          RAISE NOTICE 'Synced status % from university to company for application %', 
            NEW.status, NEW.application_id;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✓ Created sync_university_to_company function");
    
    // Trigger on universityapplications
    await client.query(`
      DROP TRIGGER IF EXISTS sync_uni_to_company_trigger ON universityapplications;
      CREATE TRIGGER sync_uni_to_company_trigger
        AFTER UPDATE ON universityapplications
        FOR EACH ROW
        EXECUTE FUNCTION sync_university_to_company();
    `);
    console.log("✓ Created trigger on universityapplications table");
    
    // Function to sync from companyapplications to universityapplications
    await client.query(`
      CREATE OR REPLACE FUNCTION sync_company_to_university()
      RETURNS TRIGGER AS $$
      BEGIN
        -- If status changed, sync to university table
        IF NEW.status IS DISTINCT FROM OLD.status THEN
          UPDATE universityapplications
          SET 
            status = NEW.status,
            updated_at = NOW()
          WHERE application_id = NEW.application_id;
          
          -- Log the sync for debugging
          RAISE NOTICE 'Synced status % from company to university for application %', 
            NEW.status, NEW.application_id;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✓ Created sync_company_to_university function");
    
    // Trigger on companyapplications
    await client.query(`
      DROP TRIGGER IF EXISTS sync_company_to_uni_trigger ON companyapplications;
      CREATE TRIGGER sync_company_to_uni_trigger
        AFTER UPDATE ON companyapplications
        FOR EACH ROW
        EXECUTE FUNCTION sync_company_to_university();
    `);
    console.log("✓ Created trigger on companyapplications table");
    
    await client.query("COMMIT");
    
    console.log("\n✅ Application sync triggers created successfully!");
    console.log("\nHow it works:");
    console.log("1. When university updates application status → company sees it");
    console.log("2. When company updates application status → university sees it");
    console.log("3. Both tables stay synchronized automatically");
    
    // Test the sync
    console.log("\n🧪 Testing sync functionality...");
    const testResult = await testSync(client);
    if (testResult) {
      console.log("✅ Sync test passed! System is working correctly.");
    } else {
      console.log("⚠️  Sync test failed. Please check the triggers.");
    }
    
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\n❌ Error creating sync triggers:", err.message);
    console.error("Details:", err);
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Test the synchronization by creating a test application
 * and updating its status
 */
const testSync = async (client) => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const testAppId = uuidv4();
    
    console.log("  Creating test application...");
    
    // Insert test application in both tables
    await client.query(`
      INSERT INTO universityapplications (
        application_id, university_id, company_id, 
        first_name, last_name, email, department, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      testAppId,
      '00000000-0000-0000-0000-000000000001', // dummy UUID
      '00000000-0000-0000-0000-000000000002', // dummy UUID
      'Test',
      'Student',
      'test@test.com',
      'Computer Science',
      'pending'
    ]);
    
    await client.query(`
      INSERT INTO companyapplications (
        application_id, university_id, company_id, 
        first_name, last_name, email, department, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      testAppId,
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      'Test',
      'Student',
      'test@test.com',
      'Computer Science',
      'pending'
    ]);
    
    console.log("  Updating status in university table...");
    
    // Update status in university table
    await client.query(`
      UPDATE universityapplications
      SET status = 'accepted'
      WHERE application_id = $1
    `, [testAppId]);
    
    // Check if company table was synced
    const result = await client.query(`
      SELECT status FROM companyapplications
      WHERE application_id = $1
    `, [testAppId]);
    
    // Clean up test data
    await client.query(`
      DELETE FROM universityapplications WHERE application_id = $1
    `, [testAppId]);
    
    await client.query(`
      DELETE FROM companyapplications WHERE application_id = $1
    `, [testAppId]);
    
    if (result.rows[0].status === 'accepted') {
      console.log("  ✓ Status synced correctly!");
      return true;
    } else {
      console.log(`  ✗ Status not synced. Expected 'accepted', got '${result.rows[0].status}'`);
      return false;
    }
    
  } catch (err) {
    console.log("  ✗ Test failed:", err.message);
    return false;
  }
};

// Run if executed directly
if (require.main === module) {
  createSyncTrigger()
    .then(() => {
      console.log("\n✅ Setup complete! Application sync is now active.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ Setup failed:", err.message);
      process.exit(1);
    });
}

module.exports = { createSyncTrigger };
