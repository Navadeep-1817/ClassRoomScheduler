"use strict";
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["Admin", "Coordinator", "Faculty", "Student"];

const UserSchema = new mongoose.Schema({
  username:   { type: String, required: true, unique: true, trim: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ROLES, required: true },
  department: {
    type: String,
    required: function () {
      return this.role === "Coordinator" || this.role === "Student";
    },
  },
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Avoid OverwriteModelError on hot-reloads / test re-requires
const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;
