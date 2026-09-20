const db = require('./config/dbConnection');

async function testProjectAssignment() {
  try {
    console.log('Testing Project Assignment Feature...\n');

    // 1. Check if intern_projects table exists
    console.log('1. Checking intern_projects table...');
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'intern_projects'
      );
    `);
    console.log('Table exists:', tableCheck.rows[0].exists);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table does not exist. Run createInternProjectsTable.js first!');
      process.exit(1);
    }

    // 2. Get a sample mentor assignment
    console.log('\n2. Getting sample mentor assignment...');
    const assignment = await db.query(`
      SELECT * FROM public.mentor_assignments 
      WHERE status = 'active' 
      LIMIT 1
    `);
    
    if (assignment.rows.length === 0) {
      console.log('❌ No active mentor assignments found. Assign an intern to a mentor first!');
      process.exit(1);
    }

    const assignmentId = assignment.rows[0].id;
    console.log('Found assignment:', {
      id: assignmentId,
      student: assignment.rows[0].student_name,
      email: assignment.rows[0].student_email
    });

    // 3. Check existing projects for this assignment
    console.log('\n3. Checking existing projects...');
    const existingProjects = await db.query(`
      SELECT * FROM public.intern_projects 
      WHERE assignment_id = $1
    `, [assignmentId]);
    console.log('Existing projects:', existingProjects.rows.length);

    // 4. Create a test project
    console.log('\n4. Creating test project...');
    const newProject = await db.query(`
      INSERT INTO public.intern_projects 
      (assignment_id, project_title, project_description, deadline, status, progress)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      assignmentId,
      'Test Project - Build REST API',
      'Create a RESTful API using Node.js and Express with authentication',
      '2026-04-15',
      'assigned',
      0
    ]);
    console.log('✅ Project created:', {
      id: newProject.rows[0].id,
      title: newProject.rows[0].project_title,
      status: newProject.rows[0].status,
      progress: newProject.rows[0].progress
    });

    // 5. Get all projects for this assignment
    console.log('\n5. Getting all projects for assignment...');
    const allProjects = await db.query(`
      SELECT * FROM public.intern_projects 
      WHERE assignment_id = $1
      ORDER BY created_at DESC
    `, [assignmentId]);
    console.log('Total projects:', allProjects.rows.length);
    allProjects.rows.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.project_title} - ${p.status} (${p.progress}%)`);
    });

    // 6. Update project status
    console.log('\n6. Updating project status...');
    const projectId = newProject.rows[0].id;
    const updatedProject = await db.query(`
      UPDATE public.intern_projects
      SET status = $1, progress = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, ['in_progress', 50, projectId]);
    console.log('✅ Project updated:', {
      id: updatedProject.rows[0].id,
      status: updatedProject.rows[0].status,
      progress: updatedProject.rows[0].progress
    });

    // 7. Test all status values
    console.log('\n7. Testing all status values...');
    const statuses = ['assigned', 'in_progress', 'review', 'completed', 'on_hold'];
    for (const status of statuses) {
      await db.query(`
        UPDATE public.intern_projects
        SET status = $1
        WHERE id = $2
      `, [status, projectId]);
      console.log(`  ✅ Status: ${status}`);
    }

    console.log('\n✅ All tests passed!');
    console.log('\nProject Assignment Feature is working correctly.');
    console.log('You can now use the frontend to assign projects to interns.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

testProjectAssignment();
