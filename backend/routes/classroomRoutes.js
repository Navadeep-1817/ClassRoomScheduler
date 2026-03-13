const express = require("express");
const { getClassrooms, createClassroom } = require("../controllers/classroomController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .get(protect, getClassrooms)
  .post(protect, restrictTo("Admin"), createClassroom);

module.exports = router;
