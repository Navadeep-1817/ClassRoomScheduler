const express = require("express");
const { getFaculty, createFaculty } = require("../controllers/facultyController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .get(protect, getFaculty)
  .post(protect, restrictTo("Admin", "Coordinator"), createFaculty);

module.exports = router;
