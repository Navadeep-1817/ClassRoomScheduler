const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Student = require("../models/Student");
const Course = require("../models/Course");

const upload = multer({ dest: "uploads/" });

exports.uploadMiddleware = upload.single("file");

exports.importStudents = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        let imported = 0;
        for (const row of results) {
          // row should have: username, name, rollNumber, department, password
          if (!row.username || !row.name || !row.rollNumber || !row.department) continue;
          
          const exists = await User.findOne({ username: row.username });
          if (exists) continue;

          const user = await User.create({
            username: row.username,
            password: row.password || "Student@123",
            role: "Student",
            department: row.department,
          });

          await Student.create({
            name: row.name,
            rollNumber: row.rollNumber,
            department: row.department,
            user: user._id,
          });
          imported++;
        }
        res.json({ message: `Successfully imported ${imported} students.` });
      } catch (err) {
        res.status(500).json({ message: err.message });
      } finally {
        fs.unlinkSync(req.file.path);
      }
    });
};

exports.importCourses = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        let imported = 0;
        for (const row of results) {
          // row should have: courseCode, courseName, department, credits
          if (!row.courseCode || !row.courseName || !row.department || !row.credits) continue;
          
          const exists = await Course.findOne({ courseCode: row.courseCode });
          if (exists) continue;

          await Course.create({
            courseCode: row.courseCode,
            courseName: row.courseName,
            department: row.department,
            credits: Number(row.credits),
          });
          imported++;
        }
        res.json({ message: `Successfully imported ${imported} courses.` });
      } catch (err) {
        res.status(500).json({ message: err.message });
      } finally {
        fs.unlinkSync(req.file.path);
      }
    });
};
