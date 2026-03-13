const express = require("express");
const { getNotifications, createNotification } = require("../controllers/notificationController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getNotifications);
router.post("/", protect, restrictTo("Admin", "Coordinator"), createNotification);

module.exports = router;
