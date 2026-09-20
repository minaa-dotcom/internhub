const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin");
const { protect, restrictTo } = require("../middleware/authmidlleware");

// All routes require admin authentication
router.use(protect);
router.use(restrictTo("admin"));

// Dashboard stats
router.get("/stats", adminController.getDashboardStats);

// User management
router.get("/users", adminController.getAllUsers);
router.delete("/users/:userId", adminController.deleteUser);
router.put("/users/:userId/role", adminController.updateUserRole);

// Messages
router.get("/messages", adminController.getAllMessages);

module.exports = router;
