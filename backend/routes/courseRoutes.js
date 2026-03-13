const express = require("express");
const { getCourses, createCourse } = require("../controllers/courseController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .get(protect, getCourses)
  .post(protect, restrictTo("Admin", "Coordinator"), createCourse);

module.exports = router;
