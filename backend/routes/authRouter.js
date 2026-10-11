const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.put("/change-password", authController.changePassword);

// Email verification routes
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);

module.exports = router;
