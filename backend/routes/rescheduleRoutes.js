const express = require("express");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { createRequest, getRequests, updateRequestStatus } = require("../controllers/rescheduleController");

const router = express.Router();

router.route("/")
  .post(protect, restrictTo("Faculty", "Admin", "Coordinator"), createRequest)
  .get(protect, restrainGetAccess, getRequests);

function restrainGetAccess(req, res, next) {
  if (["Admin", "Coordinator", "Faculty"].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
}

router.route("/:id")
  .patch(protect, restrictTo("Admin", "Coordinator"), updateRequestStatus);

module.exports = router;
