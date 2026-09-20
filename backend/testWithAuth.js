const jwt = require('jsonwebtoken');
const http = require('http');

async function testWithAuth() {
  console.log('Testing API with Authentication...\n');

  // Get a sample assignment
  const db = require('./config/dbConnection');
  const assignment = await db.query(`
    SELECT * FROM public.mentor_assignments 
    WHERE status = 'active' 
    LIMIT 1
  `);

  if (assignment.rows.length === 0) {
    console.log('❌ No active assignments found');
    process.exit(1);
  }

  const assignmentId = assignment.rows[0].id;
  console.log('Assignment ID:', assignmentId);

  // Create a test token
  const testUser = {
    id: '123',
    email: 'test@example.com',
    role: 'company'
  };

  const token = jwt.sign(testUser, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '1h'
  });

  console.log('Generated test token');
  console.log('JWT_SECRET from env:', process.env.JWT_SECRET ? 'Set' : 'Not set');

  // Make request with auth token
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/mentors/projects/${assignmentId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  console.log('\nMaking authenticated request...');
  console.log('URL:', `http://localhost:5000${options.path}`);

  const req = http.request(options, (res) => {
    console.log('\nResponse Status:', res.statusCode);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\nResponse Body:');
      try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json, null, 2));
        
        if (res.statusCode === 200) {
          console.log('\n✅ API works with authentication!');
        } else if (res.statusCode === 401) {
          console.log('\n❌ Authentication failed');
          console.log('Check JWT_SECRET in .env file');
        } else if (res.statusCode === 500) {
          console.log('\n❌ Server error - check backend console for details');
        }
      } catch (e) {
        console.log(data);
      }
      process.exit(0);
    });
  });

  req.on('error', (error) => {
    console.error('\n❌ Request failed:', error.message);
    console.error('Is backend running on port 5000?');
    process.exit(1);
  });

  req.end();
}

testWithAuth();
