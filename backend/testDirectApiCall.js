// Direct test of the controller function
const mentorController = require('./controller/mentor');
const mentorModel = require('./models/mentor');

async function testDirectApiCall() {
  try {
    console.log('Testing getInternProjects directly...\n');

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
    console.log('Testing with assignment ID:', assignmentId);
    console.log('Assignment ID type:', typeof assignmentId);
    console.log('Assignment ID length:', assignmentId.length);

    // Test the model function directly
    console.log('\n1. Testing model function...');
    try {
      const projects = await mentorModel.getInternProjects(assignmentId);
      console.log('✅ Model function works!');
      console.log('Projects found:', projects.length);
      projects.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.project_title}`);
      });
    } catch (error) {
      console.error('❌ Model function failed:', error.message);
      console.error(error.stack);
    }

    // Test with mock request/response
    console.log('\n2. Testing controller function...');
    const mockReq = {
      params: {
        assignmentId: assignmentId
      }
    };

    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log('Response status:', this.statusCode);
        console.log('Response data:', JSON.stringify(data, null, 2));
        
        if (this.statusCode === 200) {
          console.log('✅ Controller function works!');
        } else {
          console.log('❌ Controller returned error');
        }
      }
    };

    await mentorController.getInternProjects(mockReq, mockRes);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

testDirectApiCall();
