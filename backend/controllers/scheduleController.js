const Schedule = require("../models/Schedule");
const Classroom = require("../models/Classroom");
const Faculty = require("../models/Faculty");
const Course = require("../models/Course");
const { createEvents } = require("ics");

exports.getSchedules = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "Coordinator") {
      query.department = req.user.department;
    } else if (req.user.role === "Faculty") {
      if (!req.query.facultyId) {
        return res.status(400).json({ message: "Faculty ID is required for faculty view" });
      }
      query.faculty = req.query.facultyId;
    } else if (req.user.role === "Student") {
      // Students see all schedules for their department (read-only)
      query.department = req.user.department;
    }

    const schedules = await Schedule.find(query)
      .populate("course")
      .populate("faculty")
      .populate("classroom")
      .sort({ date: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { course, faculty, department, classroom, date, timeSlot } = req.body;

    // Smart Room Allocation Check
    const selectedCourse = await Course.findById(course);
    const selectedRoom = await Classroom.findById(classroom);

    if (selectedCourse && selectedRoom) {
      if (selectedRoom.capacity < selectedCourse.enrolledCount) {
        return res.status(409).json({
          message: `Room capacity (${selectedRoom.capacity}) is too small for this course (${selectedCourse.enrolledCount} students).`,
          suggestions: {} // In a full implementation, we'd suggest larger rooms
        });
      }
    }

    // Conflict Detection
    const conflicts = await Schedule.find({
      date,
      timeSlot,
      $or: [{ faculty }, { classroom }]
    });

    if (conflicts.length > 0) {
      const allClassrooms = await Classroom.find();
      const allFaculty = await Faculty.find({ department });

      const busyClassrooms = await Schedule.find({ date, timeSlot }).distinct("classroom");
      const busyFaculty = await Schedule.find({ date, timeSlot }).distinct("faculty");

      const availableClassrooms = allClassrooms.filter(
        c => !busyClassrooms.some(bc => bc.toString() === c._id.toString())
      );
      const availableFaculty = allFaculty.filter(
        f => !busyFaculty.some(bf => bf.toString() === f._id.toString())
      );

      const allTimeSlots = ["09:00-10:00", "10:00-11:00", "11:00-12:00", "13:00-14:00", "14:00-15:00"];
      const busySlots = await Schedule.find({ date, $or: [{ faculty }, { classroom }] }).distinct("timeSlot");
      const availableTimeSlots = allTimeSlots.filter(ts => !busySlots.includes(ts));

      return res.status(409).json({
        message: "Conflict detected: Double booking for faculty or classroom at this time.",
        suggestions: { availableClassrooms, availableFaculty, availableTimeSlots }
      });
    }

    const schedule = await Schedule.create({ course, faculty, department, classroom, date, timeSlot });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.exportSchedules = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "Coordinator" || req.user.role === "Student") {
      query.department = req.user.department;
    } else if (req.user.role === "Faculty") {
      if (!req.query.facultyId) {
        return res.status(400).json({ message: "Faculty ID is required for faculty view" });
      }
      query.faculty = req.query.facultyId;
    }

    const schedules = await Schedule.find(query)
      .populate("course")
      .populate("faculty")
      .populate("classroom");

    const events = schedules.map((s) => {
      const date = new Date(s.date);
      const [start, end] = s.timeSlot.split("-");
      const [startH, startM] = start.split(":").map(Number);
      const [endH, endM] = end.split(":").map(Number);

      return {
        title: `${s.course?.courseName || "Class"} (${s.course?.courseCode || ""})`,
        start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), startH, startM],
        end: [date.getFullYear(), date.getMonth() + 1, date.getDate(), endH, endM],
        location: s.classroom ? `Room ${s.classroom.roomNumber} (${s.classroom.type})` : "TBD",
        description: `Faculty: ${s.faculty?.name || "TBD"}\nDepartment: ${s.department}`,
      };
    });

    createEvents(events, (error, value) => {
      if (error) {
        return res.status(500).json({ message: "Error generating calendar" });
      }
      res.setHeader("Content-Type", "text/calendar");
      res.setHeader("Content-Disposition", "attachment; filename=\"timetable.ics\"");
      res.send(value);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
