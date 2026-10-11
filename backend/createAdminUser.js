// Script to create admin user
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'internhub',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function createAdminUser() {
  try {
    const email = 'admin@internhub.com';
    const password = 'Admin@123';
    const organizationName = 'InternHub Administration';

    console.log('\n========================================');
    console.log('CREATING ADMIN USER');
    console.log('========================================\n');

    // Check if admin already exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length > 0) {
      console.log('❌ Admin user already exists!');
      console.log(`Email: ${email}`);
      console.log('\nTo reset password, use: node resetAdminPassword.js');
      await pool.end();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    await pool.query(
      `INSERT INTO users (id, email, password, role, organization_name, email_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        uuidv4(),
        email,
        hashedPassword,
        'admin',
        organizationName,
        true,
        new Date(),
        new Date()
      ]
    );

    console.log('✅ Admin user created successfully!\n');
    console.log('Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANT: Change this password after first login!\n');

    await pool.end();
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
