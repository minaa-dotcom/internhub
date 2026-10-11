// Script to create admin user with custom email
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'internhub',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminUser() {
  try {
    console.log('\n========================================');
    console.log('CREATE CUSTOM ADMIN USER');
    console.log('========================================\n');

    // Get custom email
    const email = await question('Enter admin email: ');
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email address!');
      rl.close();
      await pool.end();
      return;
    }

    // Get custom password
    const password = await question('Enter admin password (min 6 characters): ');
    if (!password || password.length < 6) {
      console.log('❌ Password must be at least 6 characters!');
      rl.close();
      await pool.end();
      return;
    }

    // Get organization name (optional)
    const organizationName = await question('Enter organization name (optional): ') || 'InternHub Admin';

    rl.close();

    console.log('\n Creating admin user...\n');

    // Check if user already exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length > 0) {
      console.log('❌ User with this email already exists!');
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
    console.log(`Email:        ${email}`);
    console.log(`Password:     ${password}`);
    console.log(`Organization: ${organizationName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await pool.end();
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    rl.close();
    await pool.end();
    process.exit(1);
  }
}

createAdminUser();
