const http = require('http');

async function testApiEndpoint() {
  console.log('Testing API Endpoint: GET /api/mentors/projects/:assignmentId\n');

  // Get a sample assignment ID from database
  const db = require('./config/dbConnection');
  const assignment = await db.query(`
    SELECT id FROM public.mentor_assignments 
    WHERE status = 'active' 
    LIMIT 1
  `);

  if (assignment.rows.length === 0) {
    console.log('❌ No active assignments found');
    process.exit(1);
  }

  const assignmentId = assignment.rows[0].id;
  console.log('Testing with assignment ID:', assignmentId);

  // Make HTTP request to the API
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/mentors/projects/${assignmentId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log('\nMaking request to:', `http://localhost:5000${options.path}`);
  console.log('Note: This test assumes backend server is running on port 5000\n');

  const req = http.request(options, (res) => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Headers:', res.headers);

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
          console.log('\n✅ API endpoint is working!');
          console.log('Projects found:', json.projects?.length || 0);
        } else {
          console.log('\n❌ API returned error status:', res.statusCode);
        }
      } catch (e) {
        console.log(data);
        console.log('\n❌ Response is not valid JSON');
      }
      process.exit(0);
    });
  });

  req.on('error', (error) => {
    console.error('\n❌ Request failed:', error.message);
    console.error('\nIs the backend server running on port 5000?');
    console.error('Start it with: npm run dev');
    process.exit(1);
  });

  req.end();
}

testApiEndpoint();
