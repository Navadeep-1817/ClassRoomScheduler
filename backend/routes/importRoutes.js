const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { importStudents, importCourses, uploadMiddleware } = require("../controllers/bulkImportController");

const router = express.Router();

router.post("/students", protect, restrictTo("Admin", "Coordinator"), uploadMiddleware, importStudents);
router.post("/courses", protect, restrictTo("Admin", "Coordinator"), uploadMiddleware, importCourses);

module.exports = router;
