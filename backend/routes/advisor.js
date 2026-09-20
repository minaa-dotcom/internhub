const express = require("express");
const router = express.Router();
const advisorController = require("../controller/advisor");
const { protect, restrictTo } = require("../middleware/authmidlleware");

// Get all advisors (scoped to university)
router.get("/", protect, restrictTo("university", "admin"), advisorController.getAllAdvisors);

// Get all assigned students (scoped to university)
router.get("/all-students", protect, restrictTo("university", "admin"), advisorController.getAllAssignedStudents);

// Get advisor by ID
router.get("/:id", protect, advisorController.getAdvisorById);

// Create new advisor
router.post("/", protect, advisorController.createAdvisor);

// Get assigned students for an advisor
router.get("/:advisorId/students", protect, advisorController.getAssignedStudents);

// Assign student to advisor
router.post("/assign", protect, advisorController.assignStudent);

// Update student progress
router.put("/progress/:assignmentId", protect, advisorController.updateStudentProgress);

// Record student attendance
router.post("/attendance", protect, advisorController.recordAttendance);

// Create student evaluation
router.post("/evaluation", protect, advisorController.createEvaluation);

// Create student report
router.post("/report", protect, advisorController.createReport);

// Get student reports
router.get("/reports/:assignmentId", protect, advisorController.getStudentReports);

// Get student evaluations
router.get("/evaluations/:assignmentId", protect, advisorController.getStudentEvaluations);

// Get all assigned application IDs
router.get("/assigned/application-ids", protect, advisorController.getAssignedApplicationIds);

// Submit feedback for student
router.post("/feedback/:assignmentId", protect, advisorController.submitFeedback);

module.exports = router;
