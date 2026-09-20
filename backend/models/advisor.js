const db = require("../config/dbConnection");

// Get all advisors for a university
const getAllAdvisors = async (universityId) => {
  if (universityId) {
    const result = await db.query(
      `SELECT * FROM public.advisors WHERE university_id = $1 ORDER BY created_at DESC`,
      [universityId]
    );
    return result.rows;
  }
  // fallback for admin
  const result = await db.query(`SELECT * FROM public.advisors ORDER BY created_at DESC`);
  return result.rows;
};

// Get advisor by ID
const getAdvisorById = async (advisorId) => {
  const query = `
    SELECT * FROM public.advisors
    WHERE id = $1
  `;
  const result = await db.query(query, [advisorId]);
  return result.rows[0];
};

// Get advisor by user ID
const getAdvisorByUserId = async (userId) => {
  const query = `
    SELECT * FROM public.advisors
    WHERE university_id = $1
  `;
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

// Create new advisor
const createAdvisor = async (advisorData) => {
  const { university_id, first_name, last_name, email, department, phone } = advisorData;
  
  // Check if university_id exists in users table (if provided)
  if (university_id) {
    const userCheck = await db.query('SELECT id FROM public.users WHERE id = $1', [university_id]);
    if (userCheck.rows.length === 0) {
      console.log('Warning: university_id not found in users table, setting to NULL');
      // Set to null if user doesn't exist
      const query = `
        INSERT INTO public.advisors (university_id, first_name, last_name, email, department, phone)
        VALUES (NULL, $1, $2, $3, $4, $5)
        RETURNING *
      `;
      const result = await db.query(query, [first_name, last_name, email, department, phone]);
      return result.rows[0];
    }
  }
  
  const query = `
    INSERT INTO public.advisors (university_id, first_name, last_name, email, department, phone)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const result = await db.query(query, [university_id || null, first_name, last_name, email, department, phone]);
  return result.rows[0];
};

// Get assigned students for an advisor
const getAssignedStudents = async (advisorId) => {
  const query = `
    SELECT 
      sa.*,
      COALESCE(u.organization_name, sa.company_name, 'Not assigned') as company_name,
      ua.github_link,
      ua.linkedin_link,
      ua.academic_year,
      sp.week_number,
      sp.progress_percentage,
      sp.tasks_completed,
      sp.tasks_total,
      (
        SELECT COUNT(*) 
        FROM public.student_attendance 
        WHERE assignment_id = sa.id
      ) as total_attendance_days,
      (
        SELECT COUNT(*) 
        FROM public.student_attendance 
        WHERE assignment_id = sa.id AND status = 'present'
      ) as present_days,
      (
        SELECT COUNT(*) 
        FROM public.student_attendance 
        WHERE assignment_id = sa.id AND status = 'absent'
      ) as absent_days
    FROM public.student_assignments sa
    LEFT JOIN public.universityapplications ua ON ua.application_id = sa.application_id
    LEFT JOIN public.users u ON ua.company_id = u.id
    LEFT JOIN LATERAL (
      SELECT * FROM public.student_progress
      WHERE assignment_id = sa.id
      ORDER BY week_number DESC
      LIMIT 1
    ) sp ON true
    WHERE sa.advisor_id = $1
    ORDER BY sa.assigned_date DESC
  `;
  
  const result = await db.query(query, [advisorId]);
  return result.rows;
};


// Assign student to advisor
const assignStudent = async (assignmentData) => {
  const { advisor_id, application_id, student_name, student_email, department, company_name } = assignmentData;
  
  // First check if student is already assigned to any advisor
  const checkQuery = `
    SELECT sa.*, a.first_name, a.last_name 
    FROM public.student_assignments sa
    JOIN public.advisors a ON sa.advisor_id = a.id
    WHERE sa.application_id = $1 AND sa.status = 'active'
  `;
  const checkResult = await db.query(checkQuery, [application_id]);
  
  if (checkResult.rows.length > 0) {
    const existingAdvisor = checkResult.rows[0];
    throw new Error(`Student is already assigned to ${existingAdvisor.first_name} ${existingAdvisor.last_name}`);
  }
  
  const query = `
    INSERT INTO public.student_assignments 
    (advisor_id, application_id, student_name, student_email, department, company_name)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const result = await db.query(query, [
    advisor_id, 
    application_id, 
    student_name, 
    student_email, 
    department, 
    company_name
  ]);
  return result.rows[0];
};

// Update student progress
const updateStudentProgress = async (assignmentId, progressData) => {
  const { week_number, progress_percentage, tasks_completed, tasks_total, notes } = progressData;
  
  // First check if record exists
  const checkQuery = `
    SELECT id FROM public.student_progress
    WHERE assignment_id = $1 AND week_number = $2
  `;
  const checkResult = await db.query(checkQuery, [assignmentId, week_number]);
  
  let query;
  let params;
  
  if (checkResult.rows.length > 0) {
    // Update existing record
    query = `
      UPDATE public.student_progress
      SET progress_percentage = $3,
          tasks_completed = $4,
          tasks_total = $5,
          notes = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE assignment_id = $1 AND week_number = $2
      RETURNING *
    `;
    params = [assignmentId, week_number, progress_percentage, tasks_completed, tasks_total, notes];
  } else {
    // Insert new record
    query = `
      INSERT INTO public.student_progress 
      (assignment_id, week_number, progress_percentage, tasks_completed, tasks_total, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    params = [assignmentId, week_number, progress_percentage, tasks_completed, tasks_total, notes];
  }
  
  const result = await db.query(query, params);
  return result.rows[0];
};

// Record student attendance
const recordAttendance = async (attendanceData) => {
  const { assignment_id, attendance_date, status, check_in_time, check_out_time, hours_worked, notes } = attendanceData;
  
  const query = `
    INSERT INTO public.student_attendance 
    (assignment_id, attendance_date, status, check_in_time, check_out_time, hours_worked, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  
  const result = await db.query(query, [
    assignment_id,
    attendance_date,
    status,
    check_in_time,
    check_out_time,
    hours_worked,
    notes
  ]);
  return result.rows[0];
};

// Create student evaluation
const createEvaluation = async (evaluationData) => {
  const {
    assignment_id,
    advisor_id,
    evaluation_date,
    technical_skills,
    communication_skills,
    teamwork,
    problem_solving,
    professionalism,
    overall_rating,
    strengths,
    areas_for_improvement,
    comments
  } = evaluationData;
  
  const query = `
    INSERT INTO public.student_evaluations 
    (assignment_id, advisor_id, evaluation_date, technical_skills, communication_skills, 
     teamwork, problem_solving, professionalism, overall_rating, strengths, 
     areas_for_improvement, comments)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;
  
  const result = await db.query(query, [
    assignment_id,
    advisor_id,
    evaluation_date,
    technical_skills,
    communication_skills,
    teamwork,
    problem_solving,
    professionalism,
    overall_rating,
    strengths,
    areas_for_improvement,
    comments
  ]);
  return result.rows[0];
};

// Create student report
const createReport = async (reportData) => {
  const { assignment_id, report_type, report_date, title, content, attachments, submitted_by } = reportData;
  
  const query = `
    INSERT INTO public.student_reports 
    (assignment_id, report_type, report_date, title, content, attachments, submitted_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  
  const result = await db.query(query, [
    assignment_id,
    report_type,
    report_date,
    title,
    content,
    JSON.stringify(attachments),
    submitted_by
  ]);
  return result.rows[0];
};

// Get student reports
const getStudentReports = async (assignmentId) => {
  const query = `
    SELECT * FROM public.student_reports
    WHERE assignment_id = $1
    ORDER BY report_date DESC
  `;
  const result = await db.query(query, [assignmentId]);
  return result.rows;
};

// Get student evaluations
const getStudentEvaluations = async (assignmentId) => {
  const query = `
    SELECT * FROM public.student_evaluations
    WHERE assignment_id = $1
    ORDER BY evaluation_date DESC
  `;
  const result = await db.query(query, [assignmentId]);
  return result.rows;
};

// Get all assigned application IDs
const getAssignedApplicationIds = async () => {
  const query = `
    SELECT DISTINCT application_id 
    FROM public.student_assignments 
    WHERE status = 'active'
  `;
  const result = await db.query(query);
  return result.rows.map(row => row.application_id);
};

// Submit feedback for student
const submitFeedback = async (assignmentId, feedback) => {
  const query = `
    UPDATE public.student_assignments
    SET feedback = $1,
        feedback_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await db.query(query, [feedback, assignmentId]);
  return result.rows[0];
};

module.exports = {
  getAllAdvisors,
  getAdvisorById,
  getAdvisorByUserId,
  createAdvisor,
  getAssignedStudents,
  assignStudent,
  updateStudentProgress,
  recordAttendance,
  createEvaluation,
  createReport,
  getStudentReports,
  getStudentEvaluations,
  getAssignedApplicationIds,
  submitFeedback
};
