const express = require("express");
const router = express.Router();
const ctrl = require("../controller/internshipPost");
const { protect, restrictTo } = require("../middleware/authmidlleware");

router.post("/", protect, restrictTo("company"), ctrl.createPost);
router.get("/", protect, ctrl.getAllActivePosts);
router.get("/my", protect, restrictTo("company"), ctrl.getCompanyPosts);
router.patch("/:id/close", protect, restrictTo("company"), ctrl.closePost);

module.exports = router;
