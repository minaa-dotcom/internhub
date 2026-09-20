const db = require("../config/dbConnection");


const initAllTables = async () => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const res = await client.query(
      "SELECT current_database(), current_user, current_schema()"
    );
    console.log("Connected to:", res.rows[0]);

    await initUsersTable(client);
    await initApplicationsTables(client);
    await initAdvisorTables(client);
    await initMentorTables(client);
    await initInternshipPostsTable(client);

    await client.query("COMMIT");

    console.log(" All tables created successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(" Error creating tables:", err);
    throw err;
  } finally {
    client.release();
  }
};


const initUsersTable = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(30) NOT NULL,
      organization_name VARCHAR(255),
      first_login BOOLEAN DEFAULT true,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add organization_name column if it doesn't exist (for existing DBs)
  await client.query(`
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255)
  `);

 
  await client.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Trigger
  await client.query(`
    DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON public.users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  console.log(" Users table ready");
};


const initApplicationsTables = async (client) => {
  console.log("Creating application tables...");

  // University applications table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.universityapplications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID DEFAULT gen_random_uuid(),
      university_id UUID NOT NULL,
      company_id UUID NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      department VARCHAR(150),
      academic_year VARCHAR(50),
      email VARCHAR(255) NOT NULL,
      github_link TEXT,
      linkedin_link TEXT,
      cv_url TEXT,
      resume_url TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_status_uni CHECK (
        status IN ('pending', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn')
      )
    )
  `);

  // Company applications table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.companyapplications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID NOT NULL,
      university_id UUID NOT NULL,
      company_id UUID NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      department VARCHAR(150),
      academic_year VARCHAR(50),
      email VARCHAR(255) NOT NULL,
      github_link TEXT,
      linkedin_link TEXT,
      cv_url TEXT,
      resume_url TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_status_comp CHECK (
        status IN ('pending', 'under_review', 'shortlisted', 'accepted', 'rejected')
      )
    )
  `);

  // Triggers for universityapplications
  await client.query(`
    DROP TRIGGER IF EXISTS update_uni_applications_updated_at ON public.universityapplications;
    CREATE TRIGGER update_uni_applications_updated_at
      BEFORE UPDATE ON public.universityapplications
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  // Triggers for companyapplications
  await client.query(`
    DROP TRIGGER IF EXISTS update_comp_applications_updated_at ON public.companyapplications;
    CREATE TRIGGER update_comp_applications_updated_at
      BEFORE UPDATE ON public.companyapplications
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  // Indexes for universityapplications
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_uni_applications_status 
      ON public.universityapplications(status);
    CREATE INDEX IF NOT EXISTS idx_uni_applications_created_at 
      ON public.universityapplications(created_at);
    CREATE INDEX IF NOT EXISTS idx_uni_applications_university_id 
      ON public.universityapplications(university_id);
  `);

  // Indexes for companyapplications
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_comp_applications_status 
      ON public.companyapplications(status);
    CREATE INDEX IF NOT EXISTS idx_comp_applications_created_at 
      ON public.companyapplications(created_at);
    CREATE INDEX IF NOT EXISTS idx_comp_applications_company_id 
      ON public.companyapplications(company_id);
  `);

  console.log(" Application tables ready");
};


const initAdvisorTables = async (client) => {
  console.log("Creating advisor tables...");

  // Advisors table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.advisors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      university_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      department VARCHAR(150),
      phone VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Student assignments table (links students to advisors)
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.student_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      advisor_id UUID REFERENCES public.advisors(id) ON DELETE CASCADE,
      application_id UUID NOT NULL,
      student_name VARCHAR(255) NOT NULL,
      student_email VARCHAR(255) NOT NULL,
      department VARCHAR(150),
      company_name VARCHAR(255),
      assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) DEFAULT 'active',
      CONSTRAINT valid_assignment_status CHECK (
        status IN ('active', 'completed', 'terminated')
      )
    )
  `);

  // Student progress tracking table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.student_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      assignment_id UUID REFERENCES public.student_assignments(id) ON DELETE CASCADE,
      week_number INTEGER NOT NULL,
      progress_percentage INTEGER DEFAULT 0,
      tasks_completed INTEGER DEFAULT 0,
      tasks_total INTEGER DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_progress_percentage CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
    )
  `);

  // Attendance tracking table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.student_attendance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      assignment_id UUID REFERENCES public.student_assignments(id) ON DELETE CASCADE,
      attendance_date DATE NOT NULL,
      status VARCHAR(20) NOT NULL,
      check_in_time TIME,
      check_out_time TIME,
      hours_worked DECIMAL(4,2),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_attendance_status CHECK (
        status IN ('present', 'absent', 'late', 'half_day', 'leave')
      )
    )
  `);

  // Student evaluations table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.student_evaluations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      assignment_id UUID REFERENCES public.student_assignments(id) ON DELETE CASCADE,
      advisor_id UUID REFERENCES public.advisors(id),
      evaluation_date DATE NOT NULL,
      technical_skills INTEGER CHECK (technical_skills >= 1 AND technical_skills <= 5),
      communication_skills INTEGER CHECK (communication_skills >= 1 AND communication_skills <= 5),
      teamwork INTEGER CHECK (teamwork >= 1 AND teamwork <= 5),
      problem_solving INTEGER CHECK (problem_solving >= 1 AND problem_solving <= 5),
      professionalism INTEGER CHECK (professionalism >= 1 AND professionalism <= 5),
      overall_rating DECIMAL(3,2),
      strengths TEXT,
      areas_for_improvement TEXT,
      comments TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Student reports table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.student_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      assignment_id UUID REFERENCES public.student_assignments(id) ON DELETE CASCADE,
      report_type VARCHAR(50) NOT NULL,
      report_date DATE NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      attachments JSONB,
      submitted_by UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_report_type CHECK (
        report_type IN ('weekly', 'monthly', 'final', 'incident', 'achievement')
      )
    )
  `);

  // Triggers
  await client.query(`
    DROP TRIGGER IF EXISTS update_advisors_updated_at ON public.advisors;
    CREATE TRIGGER update_advisors_updated_at
      BEFORE UPDATE ON public.advisors
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  await client.query(`
    DROP TRIGGER IF EXISTS update_student_progress_updated_at ON public.student_progress;
    CREATE TRIGGER update_student_progress_updated_at
      BEFORE UPDATE ON public.student_progress
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  // Indexes
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_student_assignments_advisor 
      ON public.student_assignments(advisor_id);
    CREATE INDEX IF NOT EXISTS idx_student_assignments_application 
      ON public.student_assignments(application_id);
    CREATE INDEX IF NOT EXISTS idx_student_progress_assignment 
      ON public.student_progress(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_student_attendance_assignment 
      ON public.student_attendance(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_student_attendance_date 
      ON public.student_attendance(attendance_date);
    CREATE INDEX IF NOT EXISTS idx_student_evaluations_assignment 
      ON public.student_evaluations(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_student_reports_assignment 
      ON public.student_reports(assignment_id);
  `);

  console.log(" Advisor tables ready");
};


const initMentorTables = async (client) => {
  console.log("Creating mentor tables...");

  // Mentors table (for company mentors)
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.mentors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL,
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      department VARCHAR(150),
      position VARCHAR(150),
      phone VARCHAR(50),
      expertise TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Mentor assignments table (links interns to mentors)
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.mentor_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
      application_id UUID NOT NULL,
      student_name VARCHAR(255) NOT NULL,
      student_email VARCHAR(255) NOT NULL,
      assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) DEFAULT 'active',
      CONSTRAINT valid_mentor_assignment_status CHECK (
        status IN ('active', 'completed', 'terminated')
      )
    )
  `);

  // Add feedback columns to student_assignments if missing
  await client.query(`
    ALTER TABLE IF EXISTS public.student_assignments
      ADD COLUMN IF NOT EXISTS feedback TEXT,
      ADD COLUMN IF NOT EXISTS feedback_date TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  `);

  // Intern projects table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.intern_projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      assignment_id UUID NOT NULL REFERENCES public.mentor_assignments(id) ON DELETE CASCADE,
      project_title VARCHAR(255) NOT NULL,
      project_description TEXT,
      deadline DATE,
      status VARCHAR(50) DEFAULT 'assigned',
      progress INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_intern_projects_assignment
      ON public.intern_projects(assignment_id);
  `);

  // Triggers
  await client.query(`
    DROP TRIGGER IF EXISTS update_mentors_updated_at ON public.mentors;
    CREATE TRIGGER update_mentors_updated_at
      BEFORE UPDATE ON public.mentors
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  // Indexes
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_mentors_company 
      ON public.mentors(company_id);
    CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor 
      ON public.mentor_assignments(mentor_id);
    CREATE INDEX IF NOT EXISTS idx_mentor_assignments_application 
      ON public.mentor_assignments(application_id);
  `);

  console.log(" Mentor tables ready");
};

const initInternshipPostsTable = async (client) => {
  console.log("Creating internship_posts table...");

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.internship_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      company_name VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      department VARCHAR(150),
      location VARCHAR(150),
      work_type VARCHAR(50) DEFAULT 'on-site',
      duration VARCHAR(100),
      stipend VARCHAR(100),
      description TEXT NOT NULL,
      requirements TEXT,
      skills_required TEXT,
      positions_available INTEGER DEFAULT 1,
      status VARCHAR(50) DEFAULT 'active',
      deadline DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_post_status CHECK (status IN ('active', 'closed', 'draft')),
      CONSTRAINT valid_work_type CHECK (work_type IN ('on-site', 'remote', 'hybrid'))
    )
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_internship_posts_company
      ON public.internship_posts(company_id);
    CREATE INDEX IF NOT EXISTS idx_internship_posts_status
      ON public.internship_posts(status);
  `);

  await client.query(`
    DROP TRIGGER IF EXISTS update_internship_posts_updated_at ON public.internship_posts;
    CREATE TRIGGER update_internship_posts_updated_at
      BEFORE UPDATE ON public.internship_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  console.log(" Internship posts table ready");
};


module.exports = { initAllTables };