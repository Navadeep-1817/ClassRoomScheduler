/**
 * Comprehensive Seed Script for Production Deployment
 * Seeds: Users (all roles + departments), Classrooms, Courses, Schedules
 * 
 * Run: node seedAllData.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import models
const User = require("./models/User");
const Faculty = require("./models/Faculty");
const Student = require("./models/Student");
const Classroom = require("./models/Classroom");
const Course = require("./models/Course");
const Schedule = require("./models/Schedule");

const DEPARTMENTS = ["CSE", "ECE", "MECH", "CIVIL", "EEE", "IT"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "09:00-10:00", "10:00-11:00", "11:00-12:00",
  "12:00-13:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"
];

// Demo Users Configuration
const demoUsers = [
  // Admin
  { username: "admin", password: "Admin@123", role: "Admin", department: null, name: "System Administrator" },
  
  // Coordinators for each department
  ...DEPARTMENTS.map((dept, i) => ({
    username: `coord_${dept.toLowerCase()}`,
    password: "Coord@123",
    role: "Coordinator",
    department: dept,
    name: `${dept} Coordinator`
  })),
  
  // Faculty for each department (2 per department)
  ...DEPARTMENTS.flatMap((dept, i) => [
    {
      username: `fac_${dept.toLowerCase()}_1`,
      password: "Faculty@123",
      role: "Faculty",
      department: dept,
      name: `Dr. ${dept} Faculty One`
    },
    {
      username: `fac_${dept.toLowerCase()}_2`,
      password: "Faculty@123",
      role: "Faculty",
      department: dept,
      name: `Dr. ${dept} Faculty Two`
    }
  ]),
  
  // Students for each department (3 per department)
  ...DEPARTMENTS.flatMap((dept, i) => [
    {
      username: `stu_${dept.toLowerCase()}_01`,
      password: "Student@123",
      role: "Student",
      department: dept,
      name: `${dept} Student One`
    },
    {
      username: `stu_${dept.toLowerCase()}_02`,
      password: "Student@123",
      role: "Student",
      department: dept,
      name: `${dept} Student Two`
    },
    {
      username: `stu_${dept.toLowerCase()}_03`,
      password: "Student@123",
      role: "Student",
      department: dept,
      name: `${dept} Student Three`
    }
  ])
];

// Classroom configurations - matching actual schema
const classrooms = [
  // CSE Department Classrooms
  { roomNumber: "CS101", capacity: 60, type: "Classroom", facilities: ["Projector", "AC"] },
  { roomNumber: "CS102", capacity: 60, type: "Classroom", facilities: ["Projector", "AC"] },
  { roomNumber: "CS201", capacity: 40, type: "Lab", facilities: ["Projector", "AC", "Computers"] },
  { roomNumber: "CS202", capacity: 40, type: "Lab", facilities: ["Projector", "AC", "Computers"] },
  
  // ECE Department Classrooms
  { roomNumber: "EC101", capacity: 60, type: "Classroom", facilities: ["Projector", "AC"] },
  { roomNumber: "EC201", capacity: 30, type: "Lab", facilities: ["Projector", "AC", "Equipment"] },
  
  // MECH Department Classrooms
  { roomNumber: "ME101", capacity: 80, type: "Classroom", facilities: ["Projector"] },
  { roomNumber: "ME201", capacity: 50, type: "Lab", facilities: ["Workshop Tools"] },
  
  // CIVIL Department Classrooms
  { roomNumber: "CV101", capacity: 60, type: "Classroom", facilities: ["Projector", "AC"] },
  { roomNumber: "CV201", capacity: 40, type: "Lab", facilities: ["Projector", "AC", "Drawing Tables"] },
  
  // EEE Department Classrooms
  { roomNumber: "EE101", capacity: 60, type: "Classroom", facilities: ["Projector", "AC"] },
  { roomNumber: "EE201", capacity: 30, type: "Lab", facilities: ["Projector", "AC", "Electrical Equipment"] },
  
  // IT Department Classrooms
  { roomNumber: "IT101", capacity: 60, type: "Classroom", facilities: ["Projector", "AC"] },
  { roomNumber: "IT201", capacity: 40, type: "Lab", facilities: ["Projector", "AC", "Computers"] },
  
  // Common/Multi-purpose Classrooms
  { roomNumber: "LH01", capacity: 120, type: "Classroom", facilities: ["Projector", "AC", "Mic"] },
  { roomNumber: "LH02", capacity: 120, type: "Classroom", facilities: ["Projector", "AC", "Mic"] },
  { roomNumber: "LH03", capacity: 200, type: "Classroom", facilities: ["Projector", "AC", "Mic", "Stage"] }
];

// Course configurations
const courseTemplates = [
  { courseCode: "CS101", courseName: "Introduction to Programming", credits: 4 },
  { courseCode: "CS102", courseName: "Data Structures", credits: 4 },
  { courseCode: "CS201", courseName: "Object Oriented Programming", credits: 4 },
  { courseCode: "CS202", courseName: "Database Management Systems", credits: 4 },
  { courseCode: "CS301", courseName: "Computer Networks", credits: 3 },
  { courseCode: "EC101", courseName: "Digital Electronics", credits: 4 },
  { courseCode: "EC201", courseName: "Microprocessors", credits: 4 },
  { courseCode: "ME101", courseName: "Engineering Mechanics", credits: 4 },
  { courseCode: "ME201", courseName: "Thermodynamics", credits: 4 },
  { courseCode: "CV101", courseName: "Engineering Drawing", credits: 3 },
  { courseCode: "CV201", courseName: "Structural Analysis", credits: 4 },
  { courseCode: "EE101", courseName: "Circuit Theory", credits: 4 },
  { courseCode: "EE201", courseName: "Power Systems", credits: 4 },
  { courseCode: "IT101", courseName: "Web Technologies", credits: 3 },
  { courseCode: "IT201", courseName: "Cloud Computing", credits: 3 }
];

async function seedUsers() {
  console.log("\n👤 Seeding Users...");
  const createdUsers = [];
  
  for (const userData of demoUsers) {
    const existingUser = await User.findOne({ username: userData.username });
    
    if (existingUser) {
      console.log(`  ✓ ${userData.username} (${userData.role}) exists`);
      createdUsers.push({ user: existingUser, data: userData });
      continue;
    }

    const user = await User.create({
      username: userData.username,
      password: userData.password,
      role: userData.role,
      department: userData.department
    });

    console.log(`  ✓ Created ${userData.username} (${userData.role})`);

    if (userData.role === "Faculty") {
      await Faculty.create({
        name: userData.name,
        department: userData.department,
        user: user._id
      });
    }

    if (userData.role === "Student") {
      await Student.create({
        name: userData.name,
        department: userData.department,
        user: user._id
      });
    }
    
    createdUsers.push({ user, data: userData });
  }
  
  return createdUsers;
}

async function seedClassrooms() {
  console.log("\n🏫 Seeding Classrooms...");
  const createdClassrooms = [];
  
  for (const roomData of classrooms) {
    const existing = await Classroom.findOne({ roomNumber: roomData.roomNumber });
    
    if (existing) {
      console.log(`  ✓ Classroom ${roomData.roomNumber} exists`);
      createdClassrooms.push(existing);
      continue;
    }

    const classroom = await Classroom.create(roomData);
    console.log(`  ✓ Created classroom ${roomData.roomNumber}`);
    createdClassrooms.push(classroom);
  }
  
  return createdClassrooms;
}

async function seedCourses(facultyUsers) {
  console.log("\n📚 Seeding Courses...");
  const createdCourses = [];
  
  // Get faculty by department
  const facultyByDept = {};
  DEPARTMENTS.forEach(dept => {
    facultyByDept[dept] = facultyUsers.filter(f => f.data.department === dept);
  });
  
  for (const template of courseTemplates) {
    const dept = template.courseCode.substring(0, 2) === "CS" ? "CSE" :
                 template.courseCode.substring(0, 2) === "EC" ? "ECE" :
                 template.courseCode.substring(0, 2) === "ME" ? "MECH" :
                 template.courseCode.substring(0, 2) === "CV" ? "CIVIL" :
                 template.courseCode.substring(0, 2) === "EE" ? "EEE" :
                 template.courseCode.substring(0, 2) === "IT" ? "IT" : "CSE";
    
    const existing = await Course.findOne({ courseCode: template.courseCode });
    
    if (existing) {
      console.log(`  ✓ Course ${template.courseCode} exists`);
      createdCourses.push(existing);
      continue;
    }

    // Assign to a random faculty from the department
    const deptFaculty = facultyByDept[dept];
    const assignedFaculty = deptFaculty.length > 0 
      ? deptFaculty[Math.floor(Math.random() * deptFaculty.length)].user._id 
      : null;

    const course = await Course.create({
      courseCode: template.courseCode,
      courseName: template.courseName,
      department: dept,
      credits: template.credits,
      enrolledCount: 0
    });

    console.log(`  ✓ Created course ${template.courseCode} - ${template.courseName} (${dept})`);
    createdCourses.push(course);
  }
  
  return createdCourses;
}

async function seedSchedules(courses, classrooms) {
  console.log("\n📅 Seeding Sample Schedules...");
  
  // Create a few sample schedules
  const sampleSchedules = [
    { courseCode: "CS101", day: "Monday", timeSlot: "09:00-10:00", roomNumber: "CS101", date: new Date("2026-03-16") },
    { courseCode: "CS102", day: "Monday", timeSlot: "10:00-11:00", roomNumber: "CS102", date: new Date("2026-03-16") },
    { courseCode: "CS201", day: "Tuesday", timeSlot: "11:00-12:00", roomNumber: "CS201", date: new Date("2026-03-17") },
    { courseCode: "EC101", day: "Monday", timeSlot: "09:00-10:00", roomNumber: "EC101", date: new Date("2026-03-16") },
    { courseCode: "ME101", day: "Wednesday", timeSlot: "14:00-15:00", roomNumber: "ME101", date: new Date("2026-03-18") },
    { courseCode: "CV101", day: "Thursday", timeSlot: "09:00-10:00", roomNumber: "CV101", date: new Date("2026-03-19") },
    { courseCode: "EE101", day: "Friday", timeSlot: "10:00-11:00", roomNumber: "EE101", date: new Date("2026-03-20") },
    { courseCode: "IT101", day: "Monday", timeSlot: "14:00-15:00", roomNumber: "IT101", date: new Date("2026-03-16") }
  ];
  
  for (const sched of sampleSchedules) {
    const course = courses.find(c => c.courseCode === sched.courseCode);
    const classroom = classrooms.find(r => r.roomNumber === sched.roomNumber);
    
    if (!course || !classroom) {
      console.log(`  ⚠ Skipping ${sched.courseCode} - missing course or classroom`);
      continue;
    }

    const existing = await Schedule.findOne({
      course: course._id,
      date: sched.date,
      timeSlot: sched.timeSlot
    });

    if (existing) {
      console.log(`  ✓ Schedule for ${sched.courseCode} on ${sched.day} exists`);
      continue;
    }

    // Find faculty for this course department
    const faculty = await Faculty.findOne({ department: course.department });
    
    if (!faculty) {
      console.log(`  ⚠ No faculty found for ${course.department}, skipping schedule`);
      continue;
    }

    await Schedule.create({
      course: course._id,
      classroom: classroom._id,
      date: sched.date,
      timeSlot: sched.timeSlot,
      department: course.department,
      faculty: faculty._id
    });

    console.log(`  ✓ Created schedule: ${sched.courseCode} on ${sched.day} at ${sched.timeSlot} in ${sched.roomNumber}`);
  }
}

async function seedAllData() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ Error: MONGO_URI is not set in environment variables.");
      console.log("\nTo fix this:");
      console.log("1. Get your MongoDB Atlas connection string from:");
      console.log("   https://cloud.mongodb.com → Database → Connect → Drivers → Node.js");
      console.log("2. Update the MONGO_URI in your .env file");
      console.log("\nFormat: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Seed all data
    const users = await seedUsers();
    const classrooms = await seedClassrooms();
    
    const facultyUsers = users.filter(u => u.data.role === "Faculty");
    const courses = await seedCourses(facultyUsers);
    await seedSchedules(courses, classrooms);

    console.log("\n✅✅✅ All data seeded successfully! ✅✅✅\n");
    
    // Summary
    console.log("📊 Summary:");
    console.log(`  • Users: ${users.length} (Admin: 1, Coordinators: ${DEPARTMENTS.length}, Faculty: ${DEPARTMENTS.length * 2}, Students: ${DEPARTMENTS.length * 3})`);
    console.log(`  • Classrooms: ${classrooms.length}`);
    console.log(`  • Courses: ${courses.length}`);
    
    console.log("\n🔑 Demo Login Credentials:");
    console.log("─────────────────────────────────────────────────────");
    console.log("Role          | Username        | Password");
    console.log("─────────────────────────────────────────────────────");
    console.log("Admin         | admin           | Admin@123");
    console.log("Coordinator   | coord_cse       | Coord@123");
    console.log("Faculty       | fac_cse_1       | Faculty@123");
    console.log("Student       | stu_cse_01      | Student@123");
    console.log("─────────────────────────────────────────────────────");
    console.log("\nAll coordinators: coord_<dept> (e.g., coord_ece, coord_mech)");
    console.log("All faculty: fac_<dept>_1 or fac_<dept>_2");
    console.log("All students: stu_<dept>_01, stu_<dept>_02, stu_<dept>_03");

  } catch (error) {
    console.error("\n❌ Error seeding data:", error.message);
    if (error.message.includes("querySrv ENOTFOUND")) {
      console.log("\n💡 This error means the MongoDB connection string is incorrect.");
      console.log("   Please check your MongoDB Atlas connection string and update .env");
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed.");
    process.exit(0);
  }
}

seedAllData();
