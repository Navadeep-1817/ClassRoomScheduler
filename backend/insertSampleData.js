const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Faculty = require("./models/Faculty");
const Course = require("./models/Course");
const Classroom = require("./models/Classroom");
const Schedule = require("./models/Schedule");

mongoose.connect("mongodb://127.0.0.1:27017/smart_scheduler")
  .then(() => console.log("MongoDB Connected for Seeding"))
  .catch(err => console.error(err));

const insertData = async () => {
  try {
    await User.deleteMany({});
    await Faculty.deleteMany({});
    await Course.deleteMany({});
    await Classroom.deleteMany({});
    await Schedule.deleteMany({});

    // Admin User
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash("admin123", salt);
    const admin = await User.create({ username: "admin", password: "123", role: "Admin" }); // Triggers pre-save hook for hashing later.. wait we already hash it in pre-save hook? YES, so we just use plain pass in create.
    await User.deleteMany({username: "admin"}); // oops

    // Seed Users
    const adminUser = await User.create({ username: "admin", password: "123", role: "Admin" });
    const coordCSE = await User.create({ username: "coord_cse", password: "123", role: "Coordinator", department: "CSE" });
    const facultyUser = await User.create({ username: "fac_john", password: "123", role: "Faculty" });

    // Seed Courses
    const course1 = await Course.create({ courseCode: "CS101", courseName: "Intro to Programming", department: "CSE", credits: 3 });
    const course2 = await Course.create({ courseCode: "CS102", courseName: "Data Structures", department: "CSE", credits: 4 });

    // Seed Faculty
    const faculty1 = await Faculty.create({ name: "Dr. John Doe", department: "CSE", subjects: [course1._id, course2._id], user: facultyUser._id });

    // Seed Classrooms
    const room1 = await Classroom.create({ roomNumber: "101", capacity: 60, type: "Classroom" });
    const room2 = await Classroom.create({ roomNumber: "102", capacity: 30, type: "Lab" });

    // Seed Schedule
    const date = new Date();
    date.setHours(10, 0, 0, 0); // today 10 AM
    await Schedule.create({
      course: course1._id,
      faculty: faculty1._id,
      department: "CSE",
      classroom: room1._id,
      date: date,
      timeSlot: "10:00-11:00"
    });

    console.log("Data Seeded Successfully");
    process.exit();
  } catch (error) {
    console.error("Error with data seeding", error);
    process.exit(1);
  }
};

insertData();
