const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  department: { type: String, required: true },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true } // e.g., "09:00-10:00"
}, { timestamps: true });

module.exports = mongoose.model("Schedule", ScheduleSchema);
