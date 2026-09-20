const db = require('./config/dbConnection');

async function testProjectEndpoint() {
  try {
    console.log('Testing Project API Endpoints...\n');

    // 1. Get a sample assignment
    console.log('1. Getting sample assignment...');
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
    console.log('Student:', assignment.rows[0].student_name);

    // 2. Test getInternProjects function
    console.log('\n2. Testing getInternProjects function...');
    const mentorModel = require('./models/mentor');
    const projects = await mentorModel.getInternProjects(assignmentId);
    console.log('Projects found:', projects.length);
    projects.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.project_title} - ${p.status} (${p.progress}%)`);
    });

    // 3. Test assignProject function
    console.log('\n3. Testing assignProject function...');
    const newProject = await mentorModel.assignProject({
      assignment_id: assignmentId,
      project_title: 'Frontend Development Task',
      project_description: 'Build a responsive dashboard using React',
      deadline: '2026-05-01',
      status: 'assigned'
    });
    console.log('✅ Project created:', newProject.project_title);

    // 4. Test updateProjectStatus function
    console.log('\n4. Testing updateProjectStatus function...');
    const updated = await mentorModel.updateProjectStatus(newProject.id, 'in_progress', 25);
    console.log('✅ Project updated:', updated.status, '-', updated.progress + '%');

    // 5. Get all projects again
    console.log('\n5. Getting all projects again...');
    const allProjects = await mentorModel.getInternProjects(assignmentId);
    console.log('Total projects:', allProjects.length);
    allProjects.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.project_title} - ${p.status} (${p.progress}%)`);
    });

    console.log('\n✅ All model functions working correctly!');
    console.log('\nAPI Endpoints:');
    console.log('  POST /api/mentors/projects');
    console.log('  GET /api/mentors/projects/:assignmentId');
    console.log('  PUT /api/mentors/projects/:projectId');
    console.log('\nMake sure backend server is running on port 5000');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

testProjectEndpoint();
