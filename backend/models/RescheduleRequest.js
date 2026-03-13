const mongoose = require("mongoose");

const RescheduleRequestSchema = new mongoose.Schema({
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  proposedDate: { type: Date, required: true },
  proposedTimeSlot: { type: String, required: true },
  proposedRoom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
  reason: { type: String },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  department: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("RescheduleRequest", RescheduleRequestSchema);
