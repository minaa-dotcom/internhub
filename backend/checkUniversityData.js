require('dotenv').config();
const db = require("./config/dbConnection");

async function checkUniversityData() {
  try {
    // Check users with university role
    const universities = await db.query(`
      SELECT * FROM users 
      WHERE role = 'university' 
      LIMIT 5
    `);
    
    console.log(`Found ${universities.rows.length} universities in users table:`);
    console.log(JSON.stringify(universities.rows, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkUniversityData();
