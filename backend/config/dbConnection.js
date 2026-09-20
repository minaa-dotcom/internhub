const { Pool } = require('pg')
require('dotenv').config()

// If DATABASE_URL exists (Render), use it. Otherwise, use local DB.
let poolConfig

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
} else {
  // Local development
  poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: false
  }
}

const dbConnection = new Pool(poolConfig)

dbConnection.connect()
  .then(() => console.log("Database connected successfully"))
  .catch(err => console.error("Error connecting to database:", err))

module.exports = dbConnection