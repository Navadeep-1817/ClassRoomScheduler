require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Faculty = require("./models/Faculty");
const Student = require("./models/Student");
const Course = require("./models/Course");
const Classroom = require("./models/Classroom");
const Schedule = require("./models/Schedule");
const Notification = require("./models/Notification");

if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI. Set it in backend environment variables.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => { console.error(err); process.exit(1); });

/* ─── Helper: get date for a specific weekday this week ─────────────────── */
const weekDay = (offset) => {   // 0=Mon 1=Tue 2=Wed 3=Thu 4=Fri 5=Sat
  const d = new Date();
  const diff = (offset + 1) - d.getDay();
  const result = new Date(d);
  result.setDate(d.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const DEPTS = ["CSE", "ECE", "MECH", "CIVIL", "EEE", "IT"];
const SLOTS = ["09:00-10:00","10:00-11:00","11:00-12:00","13:00-14:00","14:00-15:00"];

/* ─── Course data per department ─────────────────────────────────────────── */
const COURSE_DATA = {
  CSE: [
    { courseCode:"CS101", courseName:"Intro to Programming",       credits:3 },
    { courseCode:"CS102", courseName:"Data Structures",            credits:4 },
    { courseCode:"CS201", courseName:"Algorithms",                 credits:4 },
    { courseCode:"CS202", courseName:"Database Management Systems",credits:3 },
  ],
  ECE: [
    { courseCode:"EC101", courseName:"Basic Electronics",                  credits:3 },
    { courseCode:"EC102", courseName:"Signals & Systems",                  credits:4 },
    { courseCode:"EC201", courseName:"Digital Signal Processing",          credits:4 },
    { courseCode:"EC202", courseName:"VLSI Design",                        credits:3 },
  ],
  MECH: [
    { courseCode:"ME101", courseName:"Engineering Mechanics",   credits:3 },
    { courseCode:"ME102", courseName:"Thermodynamics",          credits:4 },
    { courseCode:"ME201", courseName:"Fluid Mechanics",         credits:4 },
    { courseCode:"ME202", courseName:"Manufacturing Processes", credits:3 },
  ],
  CIVIL: [
    { courseCode:"CE101", courseName:"Engineering Drawing",    credits:3 },
    { courseCode:"CE102", courseName:"Structural Analysis",    credits:4 },
    { courseCode:"CE201", courseName:"Concrete Technology",    credits:4 },
    { courseCode:"CE202", courseName:"Geotechnical Engineering",credits:3 },
  ],
  EEE: [
    { courseCode:"EE101", courseName:"Circuit Theory",          credits:3 },
    { courseCode:"EE102", courseName:"Electrical Machines",     credits:4 },
    { courseCode:"EE201", courseName:"Power Systems",           credits:4 },
    { courseCode:"EE202", courseName:"Control Systems",         credits:3 },
  ],
  IT: [
    { courseCode:"IT101", courseName:"Web Technologies",        credits:3 },
    { courseCode:"IT102", courseName:"Computer Networks",       credits:4 },
    { courseCode:"IT201", courseName:"Cloud Computing",         credits:4 },
    { courseCode:"IT202", courseName:"Cyber Security",          credits:3 },
  ],
};

/* ─── Faculty data per department ────────────────────────────────────────── */
const FACULTY_DATA = {
  CSE: [
    { username:"fac_john",   name:"Dr. John Doe",       password:"Faculty@123" },
    { username:"fac_priya",  name:"Dr. Priya Sharma",   password:"Faculty@123" },
    { username:"fac_kumar",  name:"Prof. Arjun Kumar",  password:"Faculty@123" },
  ],
  ECE: [
    { username:"fac_raj",    name:"Prof. Raj Kapoor",   password:"Faculty@123" },
    { username:"fac_sneha",  name:"Dr. Sneha Reddy",    password:"Faculty@123" },
  ],
  MECH: [
    { username:"fac_suresh", name:"Dr. Suresh Babu",    password:"Faculty@123" },
    { username:"fac_dinesh", name:"Prof. Dinesh Rao",   password:"Faculty@123" },
  ],
  CIVIL: [
    { username:"fac_ramesh", name:"Dr. Ramesh Naidu",   password:"Faculty@123" },
    { username:"fac_kavya",  name:"Prof. Kavya Reddy",  password:"Faculty@123" },
  ],
  EEE: [
    { username:"fac_mohan",  name:"Dr. Mohan Krishnan", password:"Faculty@123" },
    { username:"fac_lata",   name:"Prof. Lata Devi",    password:"Faculty@123" },
  ],
  IT: [
    { username:"fac_naveen", name:"Dr. Naveen Kumar",   password:"Faculty@123" },
    { username:"fac_divya",  name:"Prof. Divya Menon",  password:"Faculty@123" },
  ],
};

/* ─── Student data per department (10 each) ─────────────────────────────── */
const STUDENT_NAMES = {
  CSE: [
    ["stu_cse_01","Alice Johnson",  "CSE2024001"],
    ["stu_cse_02","Bob Williams",   "CSE2024002"],
    ["stu_cse_03","Carol Davis",    "CSE2024003"],
    ["stu_cse_04","David Miller",   "CSE2024004"],
    ["stu_cse_05","Eva Wilson",     "CSE2024005"],
    ["stu_cse_06","Frank Moore",    "CSE2024006"],
    ["stu_cse_07","Grace Taylor",   "CSE2024007"],
    ["stu_cse_08","Henry Anderson", "CSE2024008"],
    ["stu_cse_09","Iris Thomas",    "CSE2024009"],
    ["stu_cse_10","Jack Jackson",   "CSE2024010"],
  ],
  ECE: [
    ["stu_ece_01","Karan Mehta",    "ECE2024001"],
    ["stu_ece_02","Lakshmi Nair",   "ECE2024002"],
    ["stu_ece_03","Manoj Patel",    "ECE2024003"],
    ["stu_ece_04","Nisha Gupta",    "ECE2024004"],
    ["stu_ece_05","Omar Sheikh",    "ECE2024005"],
    ["stu_ece_06","Pooja Singh",    "ECE2024006"],
    ["stu_ece_07","Qasim Raza",     "ECE2024007"],
    ["stu_ece_08","Riya Sharma",    "ECE2024008"],
    ["stu_ece_09","Sanjay Yadav",   "ECE2024009"],
    ["stu_ece_10","Tanvi Shah",     "ECE2024010"],
  ],
  MECH: [
    ["stu_me_01","Uma Shankar",    "ME2024001"],
    ["stu_me_02","Vijay Kumar",    "ME2024002"],
    ["stu_me_03","Wendy D'Souza",  "ME2024003"],
    ["stu_me_04","Xavier Mathew",  "ME2024004"],
    ["stu_me_05","Yasmin Khan",    "ME2024005"],
    ["stu_me_06","Zara Hussain",   "ME2024006"],
    ["stu_me_07","Aman Verma",     "ME2024007"],
    ["stu_me_08","Bhanu Prakash",  "ME2024008"],
    ["stu_me_09","Chetan Das",     "ME2024009"],
    ["stu_me_10","Deepa Pillai",   "ME2024010"],
  ],
  CIVIL: [
    ["stu_ce_01","Elan Murugan",    "CE2024001"],
    ["stu_ce_02","Fatima Begum",    "CE2024002"],
    ["stu_ce_03","Ganesh Babu",     "CE2024003"],
    ["stu_ce_04","Hema Latha",      "CE2024004"],
    ["stu_ce_05","Ishan Pandey",    "CE2024005"],
    ["stu_ce_06","Jaya Prasad",     "CE2024006"],
    ["stu_ce_07","Kiran Bose",      "CE2024007"],
    ["stu_ce_08","Lavanya Reddy",   "CE2024008"],
    ["stu_ce_09","Madhan Raj",      "CE2024009"],
    ["stu_ce_10","Nalini Sundar",   "CE2024010"],
  ],
  EEE: [
    ["stu_ee_01","Naveen Raju",     "EE2024001"],
    ["stu_ee_02","Oorja Thakur",    "EE2024002"],
    ["stu_ee_03","Pavan Sai",       "EE2024003"],
    ["stu_ee_04","Rachana Joshi",   "EE2024004"],
    ["stu_ee_05","Sarthak Mehta",   "EE2024005"],
    ["stu_ee_06","Tarun Bhatia",    "EE2024006"],
    ["stu_ee_07","Usha Kumari",     "EE2024007"],
    ["stu_ee_08","Varun Tiwari",    "EE2024008"],
    ["stu_ee_09","Wasim Akram",     "EE2024009"],
    ["stu_ee_10","Xena Fernandez",  "EE2024010"],
  ],
  IT: [
    ["stu_it_01","Yash Agarwal",    "IT2024001"],
    ["stu_it_02","Zoya Kapoor",     "IT2024002"],
    ["stu_it_03","Aditya Chopra",   "IT2024003"],
    ["stu_it_04","Bindiya Nair",    "IT2024004"],
    ["stu_it_05","Chirag Jain",     "IT2024005"],
    ["stu_it_06","Dharani Rao",     "IT2024006"],
    ["stu_it_07","Eliza Thomas",    "IT2024007"],
    ["stu_it_08","Farhan Malik",    "IT2024008"],
    ["stu_it_09","Gита Sharma",     "IT2024009"],
    ["stu_it_10","Harish Babu",     "IT2024010"],
  ],
};

/* ─── Schedule template: day/slot combos per dept ────────────────────────── */
// Each entry: [weekdayOffset(0=Mon), slotIndex, courseIdx, facultyIdx, roomKey]
// roomKey: 0-2 classrooms, 3-4 labs
const SCHED_TEMPLATE = {
  CSE: [
    [0,0,0,0,0],[0,2,1,1,1],[1,1,2,2,0],[1,3,3,0,0],
    [2,0,0,0,1],[2,2,1,1,0],[3,1,2,2,0],[3,4,3,0,3],
    [4,0,0,0,0],[4,2,1,1,4],[5,3,2,2,1],
  ],
  ECE: [
    [0,1,0,0,1],[0,3,1,1,2],[1,0,2,0,1],[1,2,3,1,2],
    [2,1,0,0,2],[2,3,1,1,1],[3,0,2,0,2],[3,2,3,1,4],
    [4,1,0,0,1],[4,3,1,1,3],[5,0,2,0,2],
  ],
  MECH: [
    [0,0,0,0,2],[0,2,1,1,0],[1,1,2,0,2],[1,3,3,1,0],
    [2,0,0,0,2],[2,2,1,1,2],[3,1,2,0,0],[3,4,3,1,3],
    [4,0,0,0,2],[4,2,1,1,0],[5,3,2,0,2],
  ],
  CIVIL: [
    [0,1,0,0,0],[0,3,1,1,1],[1,0,2,0,0],[1,2,3,1,1],
    [2,1,0,0,1],[2,3,1,1,0],[3,0,2,0,1],[3,2,3,1,4],
    [4,1,0,0,0],[4,3,1,1,1],[5,0,2,0,0],
  ],
  EEE: [
    [0,2,0,0,0],[0,4,1,1,2],[1,0,2,0,0],[1,3,3,1,2],
    [2,2,0,0,2],[2,4,1,1,0],[3,0,2,0,2],[3,3,3,1,3],
    [4,2,0,0,0],[4,4,1,1,2],[5,1,2,0,0],
  ],
  IT: [
    [0,0,0,0,1],[0,2,1,1,2],[1,1,2,0,1],[1,3,3,1,2],
    [2,0,0,0,2],[2,2,1,1,1],[3,1,2,0,2],[3,3,3,1,4],
    [4,0,0,0,1],[4,2,1,1,2],[5,1,2,0,1],
  ],
};

const seed = async () => {
  try {
    /* WIPE */
    await Promise.all([
      User.deleteMany({}), Faculty.deleteMany({}), Student.deleteMany({}),
      Course.deleteMany({}), Classroom.deleteMany({}),
      Schedule.deleteMany({}), Notification.deleteMany({}),
    ]);
    console.log("🗑️  Cleared all collections");

    /* ── CLASSROOMS (shared) ───────────────────────────────────────────── */
    const rooms = await Classroom.create([
      { roomNumber:"101", capacity:80, type:"Classroom" },
      { roomNumber:"102", capacity:80, type:"Classroom" },
      { roomNumber:"201", capacity:80, type:"Classroom" },
      { roomNumber:"LAB-A", capacity:35, type:"Lab" },
      { roomNumber:"LAB-B", capacity:35, type:"Lab" },
    ]);
    console.log(`🏫 ${rooms.length} classrooms created`);

    /* ── ADMIN ─────────────────────────────────────────────────────────── */
    const adminUser = await User.create({ username:"admin", password:"Admin@123", role:"Admin" });
    console.log("👑 Admin created");

    /* ── PER-DEPARTMENT: coordinators, faculty, students, courses ──────── */
    const allCoursesByDept    = {};
    const allFacultyByDept    = {};
    const coordUsersByDept    = {};

    for (const dept of DEPTS) {
      /* Coordinator */
      const coordUser = await User.create({
        username: `coord_${dept.toLowerCase()}`,
        password: "Coord@123",
        role: "Coordinator",
        department: dept,
      });
      coordUsersByDept[dept] = coordUser;

      /* Faculty */
      const facDocs = [];
      for (const fd of FACULTY_DATA[dept]) {
        const facUser = await User.create({
          username: fd.username, password: fd.password, role: "Faculty",
        });
        const fac = await Faculty.create({
          name: fd.name, department: dept, user: facUser._id,
        });
        facDocs.push(fac);
      }
      allFacultyByDept[dept] = facDocs;

      /* Courses */
      const courseDocs = await Course.create(
        COURSE_DATA[dept].map(c => ({ ...c, department: dept }))
      );
      allCoursesByDept[dept] = courseDocs;

      /* Update faculty subjects */
      facDocs.forEach((f, i) => {
        const assigned = courseDocs.filter((_, ci) => ci % facDocs.length === i);
        Faculty.findByIdAndUpdate(f._id, { subjects: assigned.map(c => c._id) }).exec();
      });

      /* Students (10 per dept) */
      for (const [uname, name, roll] of STUDENT_NAMES[dept]) {
        const stuUser = await User.create({
          username: uname, password: "Student@123", role: "Student", department: dept,
        });
        await Student.create({ name, rollNumber: roll, department: dept, user: stuUser._id });
      }

      console.log(`✅ ${dept}: coordinator + ${facDocs.length} faculty + ${STUDENT_NAMES[dept].length} students + ${courseDocs.length} courses`);
    }

    /* ── SCHEDULES ─────────────────────────────────────────────────────── */
    const schedulePayloads = [];
    for (const dept of DEPTS) {
      const courses = allCoursesByDept[dept];
      const faculty = allFacultyByDept[dept];
      const template = SCHED_TEMPLATE[dept];

      for (const [dayOff, slotIdx, courseIdx, facIdx, roomIdx] of template) {
        schedulePayloads.push({
          course:    courses[courseIdx % courses.length]._id,
          faculty:   faculty[facIdx   % faculty.length]._id,
          department: dept,
          classroom: rooms[roomIdx % rooms.length]._id,
          date:      weekDay(dayOff),
          timeSlot:  SLOTS[slotIdx],
        });
      }
    }
    await Schedule.create(schedulePayloads);
    console.log(`📅 ${schedulePayloads.length} schedules created across all departments`);

    /* ── NOTIFICATIONS ─────────────────────────────────────────────────── */
    const notifPayloads = [
      { message:"Welcome! Timetables for all departments are now live for this week.", type:"success", department:"ALL",   createdBy: adminUser._id },
    ];
    for (const dept of DEPTS) {
      notifPayloads.push({
        message: `${dept} weekly schedule has been published. Check your timetable.`,
        type: "info", department: dept,
        createdBy: coordUsersByDept[dept]._id,
      });
    }
    // A few warning notifications
    notifPayloads.push(
      { message:"CS201 Algorithms lab on Friday moved to LAB-B. Please check updated schedule.", type:"warning", department:"CSE",   createdBy: coordUsersByDept["CSE"]._id },
      { message:"EC201 DSP lecture rescheduled. New slot: Thursday 09:00-10:00 in Room 201.", type:"warning", department:"ECE",   createdBy: coordUsersByDept["ECE"]._id },
      { message:"ME102 Thermodynamics exam scheduled next Monday at 09:00.",                   type:"warning", department:"MECH",  createdBy: coordUsersByDept["MECH"]._id },
    );
    await Notification.create(notifPayloads);
    console.log(`🔔 ${notifPayloads.length} notifications created`);

    /* ── SUMMARY ─────────────────────────────────────────────────────────── */
    console.log("\n🎉 Full seed complete!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(" ROLE         USERNAME              PASSWORD      DEPT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(" Admin        admin                 Admin@123");
    for (const d of DEPTS) {
      console.log(` Coordinator  coord_${d.toLowerCase().padEnd(4,' ')}             Coord@123     ${d}`);
    }
    console.log(" Faculty      fac_john              Faculty@123   CSE");
    console.log(" Faculty      fac_raj               Faculty@123   ECE");
    console.log(" Faculty      fac_suresh            Faculty@123   MECH  (see others in DB)");
    console.log(" Student      stu_cse_01..10        Student@123   CSE");
    console.log(" Student      stu_ece_01..10        Student@123   ECE");
    console.log(" Student      stu_me_01..10         Student@123   MECH");
    console.log(" Student      stu_ce_01..10         Student@123   CIVIL");
    console.log(" Student      stu_ee_01..10         Student@123   EEE");
    console.log(" Student      stu_it_01..10         Student@123   IT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(` Total: 1 Admin | 6 Coordinators | ${Object.values(FACULTY_DATA).flat().length} Faculty | 60 Students`);
    console.log(`        ${DEPTS.flatMap(d=>COURSE_DATA[d]).length} Courses | ${schedulePayloads.length} Schedules | ${rooms.length} Classrooms\n`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    console.error(err);
    process.exit(1);
  }
};

seed();
