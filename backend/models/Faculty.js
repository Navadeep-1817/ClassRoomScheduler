const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Links to login
});

module.exports = mongoose.model("Faculty", FacultySchema);
