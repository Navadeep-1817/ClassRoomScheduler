const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  department: { type: String, required: true },
  credits: { type: Number, required: true },
  enrolledCount: { type: Number, default: 0 }
});

module.exports = mongoose.model("Course", CourseSchema);
