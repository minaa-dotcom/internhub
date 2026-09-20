const db = require("../config/dbConnection");

async function createInternProjectsTable() {
  try {
    console.log("Creating intern_projects table...\n");
    
    // Create intern_projects table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.intern_projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assignment_id UUID NOT NULL,
        project_title VARCHAR(255) NOT NULL,
        project_description TEXT,
        deadline DATE,
        status VARCHAR(50) DEFAULT 'assigned',
        progress INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_assignment
          FOREIGN KEY (assignment_id)
          REFERENCES mentor_assignments(id)
          ON DELETE CASCADE
      );
    `;
    
    await db.query(createTableQuery);
    console.log("✓ intern_projects table created successfully\n");
    
    // Create index for faster queries
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_intern_projects_assignment 
      ON public.intern_projects(assignment_id);
    `;
    
    await db.query(createIndexQuery);
    console.log("✓ Index created successfully\n");
    
    console.log("=================================");
    console.log("Setup completed! ✓");
    console.log("=================================");
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    process.exit(0);
  }
}

createInternProjectsTable();
