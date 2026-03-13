const express = require("express");
const { getSchedules, createSchedule, exportSchedules } = require("../controllers/scheduleController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/export")
  .get(protect, exportSchedules);

router.route("/")
  .get(protect, getSchedules)
  .post(protect, restrictTo("Admin", "Coordinator"), createSchedule);

module.exports = router;
