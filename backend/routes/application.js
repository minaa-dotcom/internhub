const express = require("express");

const ApplicationRouter = express.Router();
const controller = require("../controller/application");
const { protect, restrictTo } = require("../middleware/authmidlleware");


ApplicationRouter.post(
  "/",
  protect,
  restrictTo("university"),
  controller.applyInternship 
);

ApplicationRouter.get(
  "/university",
  protect,
  // Allow both university admins and anyone accessing university data
  controller.getUniversityApplications
);

// Stats endpoint MUST come before parameterized routes
ApplicationRouter.get(
  "/company/stats",
  protect,
  restrictTo("company"),
  controller.getCompanyStats
);

ApplicationRouter.get(
  "/company",
  protect,
  restrictTo("company"),
  controller.getCompanyApplications
);

ApplicationRouter.patch(
  "/:id/status",
  protect,
  restrictTo("company"),
  controller.reviewApplication
);

// Add review endpoint (alias for status update)
ApplicationRouter.put(
  "/:id/review",
  protect,
  restrictTo("company"),
  controller.reviewApplication
);

module.exports = ApplicationRouter;