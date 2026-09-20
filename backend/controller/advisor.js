const advisorModel = require("../models/advisor");
const db = require("../config/dbConnection");

// Get all advisors (scoped to university)
const getAllAdvisors = async (req, res) => {
  try {
    const universityId = req.user.role === 'university' ? req.user.id : null;
    const advisors = await advisorModel.getAllAdvisors(universityId);
    res.status(200).json({ success: true, advisors });
  } catch (error) {
    console.error("Error fetching advisors:", error);
    res.status(500).json({ success: false, message: "Failed to fetch advisors", error: error.message });
  }
};

// Get advisor by ID
const getAdvisorById = async (req, res) => {
  try {
    const { id } = req.params;
    const advisor = await advisorModel.getAdvisorById(id);
    
    if (!advisor) {
      return res.status(404).json({
        success: false,
        message: "Advisor not found"
      });
    }
    
    res.status(200).json({
      success: true,
      advisor
    });
  } catch (error) {
    console.error("Error fetching advisor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch advisor",
      error: error.message
    });
  }
};

// Create new advisor
const createAdvisor = async (req, res) => {
  try {
    console.log('Creating advisor with data:', req.body);
    const advisorData = req.body;
    const advisor = await advisorModel.createAdvisor(advisorData);
    console.log('Advisor created successfully:', advisor);
    
    res.status(201).json({
      success: true,
      message: "Advisor created successfully",
      advisor
    });
  } catch (error) {
    console.error("Error creating advisor:", error);
    console.error("Error code:", error.code);
    console.error("Error detail:", error.detail);
    console.error("Error stack:", error.stack);
    
    // Handle duplicate email error
    if (error.code === '23505' && error.constraint === 'advisors_email_key') {
      return res.status(400).json({
        success: false,
        message: "An advisor with this email already exists. Please use a different email.",
        error: "Duplicate email"
      });
    }

    // Handle foreign key violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: "Invalid university ID — university account not found.",
        error: error.detail || error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create advisor",
      error: error.detail || error.message || "Unknown error"
    });
  }
};

// Get assigned students for an advisor
const getAssignedStudents = async (req, res) => {
  try {
    const { advisorId } = req.params;
    const students = await advisorModel.getAssignedStudents(advisorId);
    
    // Calculate attendance rate for each student
    const studentsWithStats = students.map(student => ({
      ...student,
      attendance_summary: {
        total_days: parseInt(student.total_attendance_days) || 0,
        present: parseInt(student.present_days) || 0,
        absent: parseInt(student.absent_days) || 0,
        attendance_rate: student.total_attendance_days > 0 
          ? Math.round((student.present_days / student.total_attendance_days) * 100)
          : 0
      },
      progress: {
        week_number: student.week_number || 1,
        progress_percentage: student.progress_percentage || 0,
        tasks_completed: student.tasks_completed || 0,
        tasks_total: student.tasks_total || 0
      }
    }));
    
    res.status(200).json({
      success: true,
      students: studentsWithStats
    });
  } catch (error) {
    console.error("Error fetching assigned students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned students",
      error: error.message
    });
  }
};


// Assign student to advisor
const assignStudent = async (req, res) => {
  try {
    const assignmentData = req.body;
    const assignment = await advisorModel.assignStudent(assignmentData);
    
    res.status(201).json({
      success: true,
      message: "Student assigned successfully",
      assignment
    });
  } catch (error) {
    console.error("Error assigning student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign student",
      error: error.message
    });
  }
};

// Update student progress
const updateStudentProgress = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const progressData = req.body;
    
    const progress = await advisorModel.updateStudentProgress(assignmentId, progressData);
    
    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      progress
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error: error.message
    });
  }
};

// Record student attendance
const recordAttendance = async (req, res) => {
  try {
    const attendanceData = req.body;
    const attendance = await advisorModel.recordAttendance(attendanceData);
    
    res.status(201).json({
      success: true,
      message: "Attendance recorded successfully",
      attendance
    });
  } catch (error) {
    console.error("Error recording attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record attendance",
      error: error.message
    });
  }
};

// Create student evaluation
const createEvaluation = async (req, res) => {
  try {
    const evaluationData = req.body;
    const evaluation = await advisorModel.createEvaluation(evaluationData);
    
    res.status(201).json({
      success: true,
      message: "Evaluation created successfully",
      evaluation
    });
  } catch (error) {
    console.error("Error creating evaluation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create evaluation",
      error: error.message
    });
  }
};

// Create student report
const createReport = async (req, res) => {
  try {
    const reportData = req.body;
    const report = await advisorModel.createReport(reportData);
    
    res.status(201).json({
      success: true,
      message: "Report created successfully",
      report
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create report",
      error: error.message
    });
  }
};

// Get student reports
const getStudentReports = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const reports = await advisorModel.getStudentReports(assignmentId);
    
    res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message
    });
  }
};

// Get student evaluations
const getStudentEvaluations = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const evaluations = await advisorModel.getStudentEvaluations(assignmentId);
    
    res.status(200).json({
      success: true,
      evaluations
    });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch evaluations",
      error: error.message
    });
  }
};

// Get all assigned application IDs
const getAssignedApplicationIds = async (req, res) => {
  try {
    const applicationIds = await advisorModel.getAssignedApplicationIds();
    
    res.status(200).json({
      success: true,
      assignedApplicationIds: applicationIds
    });
  } catch (error) {
    console.error("Error fetching assigned application IDs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned application IDs",
      error: error.message
    });
  }
};

// Submit feedback for student
const submitFeedback = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { feedback } = req.body;
    
    if (!feedback || !feedback.trim()) {
      return res.status(400).json({
        success: false,
        message: "Feedback is required"
      });
    }

    const result = await advisorModel.submitFeedback(assignmentId, feedback.trim());
    
    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: result
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message
    });
  }
};

// Get all assigned students (scoped to university)
const getAllAssignedStudents = async (req, res) => {
  try {
    const universityId = req.user.role === 'university' ? req.user.id : null;
    const universityFilter = universityId
      ? `WHERE sa.status = 'active' AND a.university_id = '${universityId}'`
      : `WHERE sa.status = 'active'`;

    const query = `
      SELECT 
        sa.*,
        a.first_name as advisor_first_name,
        a.last_name as advisor_last_name,
        sp.week_number,
        sp.progress_percentage,
        sp.tasks_completed,
        sp.tasks_total,
        (SELECT COUNT(*) FROM public.student_attendance WHERE assignment_id = sa.id) as total_attendance_days,
        (SELECT COUNT(*) FROM public.student_attendance WHERE assignment_id = sa.id AND status = 'present') as present_days,
        (SELECT COUNT(*) FROM public.student_attendance WHERE assignment_id = sa.id AND status = 'absent') as absent_days
      FROM public.student_assignments sa
      LEFT JOIN public.advisors a ON sa.advisor_id = a.id
      LEFT JOIN LATERAL (
        SELECT * FROM public.student_progress WHERE assignment_id = sa.id ORDER BY week_number DESC LIMIT 1
      ) sp ON true
      ${universityFilter}
      ORDER BY sa.assigned_date DESC
    `;

    const result = await db.query(query);
    const studentsWithStats = result.rows.map(student => ({
      ...student,
      attendance_summary: {
        total_days: parseInt(student.total_attendance_days) || 0,
        present: parseInt(student.present_days) || 0,
        absent: parseInt(student.absent_days) || 0,
        attendance_rate: student.total_attendance_days > 0
          ? Math.round((student.present_days / student.total_attendance_days) * 100) : 0
      },
      progress: {
        week_number: student.week_number || 1,
        progress_percentage: student.progress_percentage || 0,
        tasks_completed: student.tasks_completed || 0,
        tasks_total: student.tasks_total || 0
      }
    }));

    res.status(200).json({ success: true, students: studentsWithStats });
  } catch (error) {
    console.error("Error fetching all assigned students:", error);
    res.status(500).json({ success: false, message: "Failed to fetch assigned students", error: error.message });
  }
};

module.exports = {
  getAllAdvisors,
  getAdvisorById,
  createAdvisor,
  getAssignedStudents,
  getAllAssignedStudents,
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
