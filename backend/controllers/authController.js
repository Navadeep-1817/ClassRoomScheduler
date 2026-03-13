const User = require("../models/User");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id, role, department) => {
  return jwt.sign({ id, role, department }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

exports.register = async (req, res) => {
  const { username, password, role, department, name } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ username, password, role, department });

    if (role === "Faculty") {
      await Faculty.create({ name: name || username, department, user: user._id });
    }

    if (role === "Student") {
      await Student.create({ name: name || username, department, user: user._id });
    }

    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      department: user.department,
      token: generateToken(user._id, user.role, user.department)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      let facultyId = null;
      let studentId = null;

      if (user.role === "Faculty") {
        const faculty = await Faculty.findOne({ user: user._id });
        if (faculty) facultyId = faculty._id;
      }

      if (user.role === "Student") {
        const student = await Student.findOne({ user: user._id });
        if (student) studentId = student._id;
      }

      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        department: user.department,
        facultyId,
        studentId,
        token: generateToken(user._id, user.role, user.department)
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
