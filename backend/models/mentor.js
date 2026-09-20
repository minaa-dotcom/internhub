const db = require("../config/dbConnection");

// Get all mentors for a company
const getMentorsByCompany = async (companyId) => {
  const query = `
    SELECT * FROM public.mentors
    WHERE company_id = $1
    ORDER BY created_at DESC
  `;
  const result = await db.query(query, [companyId]);
  return result.rows;
};

// Get mentor by ID
const getMentorById = async (mentorId) => {
  const query = `
    SELECT * FROM public.mentors
    WHERE id = $1
  `;
  const result = await db.query(query, [mentorId]);
  return result.rows[0];
};

// Create new mentor
const createMentor = async (mentorData) => {
  const { company_id, user_id, first_name, last_name, email, department, position, phone, expertise } = mentorData;
  
  const query = `
    INSERT INTO public.mentors (company_id, user_id, first_name, last_name, email, department, position, phone, expertise)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  
  const result = await db.query(query, [company_id, user_id, first_name, last_name, email, department, position, phone, expertise]);
  return result.rows[0];
};

// Update mentor
const updateMentor = async (mentorId, mentorData) => {
  const { first_name, last_name, email, department, position, phone, expertise } = mentorData;
  
  const query = `
    UPDATE public.mentors
    SET first_name = $1, last_name = $2, email = $3, department = $4, 
        position = $5, phone = $6, expertise = $7, updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *
  `;
  
  const result = await db.query(query, [first_name, last_name, email, department, position, phone, expertise, mentorId]);
  return result.rows[0];
};

// Delete mentor
const deleteMentor = async (mentorId) => {
  const query = `DELETE FROM public.mentors WHERE id = $1 RETURNING *`;
  const result = await db.query(query, [mentorId]);
  return result.rows[0];
};

// Assign intern to mentor (with validation to ensure 1:1 relationship)
const assignIntern = async (assignmentData) => {
  const { mentor_id, application_id, student_name, student_email } = assignmentData;
  
  // Check if student is already assigned to ANY mentor
  const checkQuery = `
    SELECT mentor_id, m.first_name as mentor_first_name, m.last_name as mentor_last_name
    FROM public.mentor_assignments ma
    LEFT JOIN public.mentors m ON ma.mentor_id = m.id
    WHERE ma.application_id = $1 AND ma.status = 'active'
  `;
  const checkResult = await db.query(checkQuery, [application_id]);
  
  if (checkResult.rows.length > 0) {
    const existingMentor = checkResult.rows[0];
    throw new Error(`This student is already assigned to ${existingMentor.mentor_first_name} ${existingMentor.mentor_last_name}. Please unassign first.`);
  }
  
  const query = `
    INSERT INTO public.mentor_assignments (mentor_id, application_id, student_name, student_email)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  
  const result = await db.query(query, [mentor_id, application_id, student_name, student_email]);
  return result.rows[0];
};

// Get assigned interns for a mentor
const getAssignedInterns = async (mentorId) => {
  const query = `
    SELECT 
      ma.*,
      m.first_name as mentor_first_name,
      m.last_name as mentor_last_name
    FROM public.mentor_assignments ma
    LEFT JOIN public.mentors m ON ma.mentor_id = m.id
    WHERE ma.mentor_id = $1
    ORDER BY ma.assigned_date DESC
  `;
  const result = await db.query(query, [mentorId]);
  return result.rows;
};

// Get all assigned interns (for all mentors)
const getAllAssignedInterns = async () => {
  const query = `
    SELECT 
      ma.*,
      m.first_name as mentor_first_name,
      m.last_name as mentor_last_name
    FROM public.mentor_assignments ma
    LEFT JOIN public.mentors m ON ma.mentor_id = m.id
    WHERE ma.status = 'active'
    ORDER BY ma.assigned_date DESC
  `;
  const result = await db.query(query);
  return result.rows;
};

// Get all assigned application IDs (to filter already assigned interns)
const getAssignedApplicationIds = async () => {
  const query = `
    SELECT DISTINCT application_id
    FROM public.mentor_assignments
    WHERE status = 'active'
  `;
  const result = await db.query(query);
  return result.rows.map(row => row.application_id);
};

// Assign project to intern
const assignProject = async (projectData) => {
  const { assignment_id, project_title, project_description, deadline, status } = projectData;
  
  const query = `
    INSERT INTO public.intern_projects (assignment_id, project_title, project_description, deadline, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const result = await db.query(query, [assignment_id, project_title, project_description, deadline, status || 'assigned']);
  return result.rows[0];
};

// Get projects for an intern
const getInternProjects = async (assignmentId) => {
  const query = `
    SELECT * FROM public.intern_projects
    WHERE assignment_id = $1
    ORDER BY created_at DESC
  `;
  const result = await db.query(query, [assignmentId]);
  return result.rows;
};

// Update project status
const updateProjectStatus = async (projectId, status, progress) => {
  const query = `
    UPDATE public.intern_projects
    SET status = $1, progress = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;
  const result = await db.query(query, [status, progress, projectId]);
  return result.rows[0];
};

module.exports = {
  getMentorsByCompany,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  assignIntern,
  getAssignedInterns,
  getAllAssignedInterns,
  getAssignedApplicationIds,
  assignProject,
  getInternProjects,
  updateProjectStatus
};
