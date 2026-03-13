const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "warning", "success"], default: "info" },
  department: { type: String, default: "ALL" }, // "ALL" means everyone sees it
  targetAudience: { type: String, enum: ["All", "Coordinator", "Faculty", "Student"], default: "All" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);
