const express = require("express");
const { getDashboardStats } = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", protect, restrictTo("Admin"), getDashboardStats);

module.exports = router;
