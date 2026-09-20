const express = require("express");
const router = express.Router();
const mentorController = require("../controller/mentor");
const { protect } = require("../middleware/authmidlleware");

// Get all mentors for a company
router.get("/company/:companyId", protect, mentorController.getMentorsByCompany);

// Get all assigned interns (for all mentors)
router.get("/all-interns", protect, mentorController.getAllAssignedInterns);

// Get all assigned application IDs
router.get("/assigned/application-ids", protect, mentorController.getAssignedApplicationIds);

// Project routes - MUST come before /:id route to avoid conflicts
router.post("/projects", protect, mentorController.assignProject);
router.get("/projects/:assignmentId", protect, mentorController.getInternProjects);
router.put("/projects/:projectId", protect, mentorController.updateProjectStatus);

// Get mentor by ID
router.get("/:id", protect, mentorController.getMentorById);

// Create new mentor
router.post("/", protect, mentorController.createMentor);

// Update mentor
router.put("/:id", protect, mentorController.updateMentor);

// Delete mentor
router.delete("/:id", protect, mentorController.deleteMentor);

// Assign intern to mentor
router.post("/assign", protect, mentorController.assignIntern);

// Get assigned interns for a mentor - MUST come after project routes
router.get("/:mentorId/interns", protect, mentorController.getAssignedInterns);

module.exports = router;
