const Classroom = require("../models/Classroom");
const Faculty = require("../models/Faculty");
const Course = require("../models/Course");
const Schedule = require("../models/Schedule");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalClassrooms = await Classroom.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalCourses = await Course.countDocuments();
    
    // For "Today's scheduled classes" we just filter schedules.
    // In realistic scenarios we'd check against actual today date.
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const endOfToday = new Date();
    endOfToday.setHours(23,59,59,999);

    const todaysClasses = await Schedule.countDocuments({
      date: { $gte: startOfToday, $lte: endOfToday }
    });

    // Department-wise overview
    const departmentSchedules = await Schedule.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    res.json({
      totalClassrooms,
      totalFaculty,
      totalCourses,
      todaysClasses,
      departmentSchedules
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
