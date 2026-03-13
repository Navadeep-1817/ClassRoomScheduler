const mongoose = require("mongoose");

const ClassroomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  type: { type: String, enum: ["Classroom", "Lab"], required: true }
});

module.exports = mongoose.model("Classroom", ClassroomSchema);
