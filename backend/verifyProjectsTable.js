const db = require('./config/dbConnection');

async function verifyProjectsTable() {
  try {
    console.log('Verifying intern_projects table...\n');

    // 1. Check if table exists
    console.log('1. Checking if table exists...');
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'intern_projects'
      );
    `);
    console.log('Table exists:', tableExists.rows[0].exists);

    if (!tableExists.rows[0].exists) {
      console.log('\n❌ Table does not exist!');
      console.log('Run this command to create it:');
      console.log('node dbSetup/createInternProjectsTable.js');
      process.exit(1);
    }

    // 2. Check table structure
    console.log('\n2. Checking table structure...');
    const columns = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'intern_projects'
      ORDER BY ordinal_position;
    `);
    
    console.log('Columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // 3. Check foreign key constraints
    console.log('\n3. Checking foreign key constraints...');
    const constraints = await db.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'intern_projects';
    `);
    
    if (constraints.rows.length > 0) {
      console.log('Foreign keys:');
      constraints.rows.forEach(fk => {
        console.log(`  - ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('No foreign keys found');
    }

    // 4. Check if mentor_assignments table exists
    console.log('\n4. Checking mentor_assignments table...');
    const assignmentsTable = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mentor_assignments'
      );
    `);
    console.log('mentor_assignments exists:', assignmentsTable.rows[0].exists);

    if (!assignmentsTable.rows[0].exists) {
      console.log('❌ mentor_assignments table does not exist!');
      process.exit(1);
    }

    // 5. Count records
    console.log('\n5. Counting records...');
    const projectCount = await db.query('SELECT COUNT(*) FROM public.intern_projects');
    const assignmentCount = await db.query('SELECT COUNT(*) FROM public.mentor_assignments');
    console.log('Projects:', projectCount.rows[0].count);
    console.log('Assignments:', assignmentCount.rows[0].count);

    // 6. Test query
    console.log('\n6. Testing query...');
    const testQuery = await db.query(`
      SELECT * FROM public.intern_projects
      LIMIT 1
    `);
    if (testQuery.rows.length > 0) {
      console.log('Sample project:', testQuery.rows[0]);
    } else {
      console.log('No projects in database yet');
    }

    console.log('\n✅ Table verification complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

verifyProjectsTable();
