const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin");
const { protect, restrictTo } = require("../middleware/authmidlleware");

// Security: All admin routes require authentication AND admin role
// This middleware chain ensures:
// 1. User is logged in (protect)
// 2. User has 'admin' role (restrictTo)
router.use(protect);
router.use(restrictTo("admin"));

// Additional security check middleware for admin routes
router.use((req, res, next) => {
  // Double-check admin role (defense in depth)
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required."
    });
  }
  
  // Log admin access for security audit
  console.log(`[ADMIN ACCESS] ${req.user.email} accessed ${req.method} ${req.originalUrl} at ${new Date().toISOString()}`);
  
  next();
});

// Dashboard stats
router.get("/stats", adminController.getDashboardStats);

// Recent activities
router.get("/activities", adminController.getRecentActivities);

// User management
router.get("/users", adminController.getAllUsers);
router.delete("/users/:userId", adminController.deleteUser);
router.put("/users/:userId/role", adminController.updateUserRole);
router.put("/users/:userId/status", adminController.toggleUserStatus);
router.post("/users/:userId/reset-password", adminController.resetUserPassword);

// University management
router.get("/universities", adminController.getAllUniversities);

// Company management
router.get("/companies", adminController.getAllCompanies);

// Messages
router.get("/messages", adminController.getAllMessages);

module.exports = router;
