require('dotenv').config();
const db = require("./config/dbConnection");

async function testUniversitiesTable() {
  try {
    console.log("🔍 Testing universities table...\n");

    // Check columns
    const columns = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'universities'
      ORDER BY ordinal_position
    `);
    
    if (columns.rows.length === 0) {
      console.log("❌ Universities table doesn't exist!");
      process.exit(1);
    }

    console.log("📋 Columns in universities table:");
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    console.log("");

    // Count universities
    const count = await db.query("SELECT COUNT(*) FROM universities");
    console.log(`🏛️ Total universities: ${count.rows[0].count}\n`);

    // Sample data
    const sample = await db.query("SELECT * FROM universities LIMIT 3");
    console.log("📊 Sample data:");
    sample.rows.forEach((uni, i) => {
      console.log(`${i + 1}. ${JSON.stringify(uni, null, 2)}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testUniversitiesTable();
