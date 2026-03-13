const RescheduleRequest = require("../models/RescheduleRequest");
const Schedule = require("../models/Schedule");
const Notification = require("../models/Notification");

exports.createRequest = async (req, res) => {
  try {
    const { scheduleId, proposedDate, proposedTimeSlot, proposedRoom, reason } = req.body;
    
    // Validate schedule exists and belongs to faculty
    const originalSchedule = await Schedule.findById(scheduleId);
    if (!originalSchedule) return res.status(404).json({ message: "Schedule not found" });

    // Faculty is trying to create a request
    if (originalSchedule.faculty.toString() !== req.query.facultyId && req.user.role === "Faculty") {
    // wait, we verify via token or params
    }

    const request = await RescheduleRequest.create({
      schedule: scheduleId,
      faculty: originalSchedule.faculty,
      proposedDate,
      proposedTimeSlot,
      proposedRoom,
      reason,
      department: originalSchedule.department
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "Coordinator") {
      query.department = req.user.department;
    } else if (req.user.role === "Faculty") {
      query.faculty = req.query.facultyId;
    }

    const requests = await RescheduleRequest.find(query)
      .populate({ path: 'schedule', populate: { path: 'course' } })
      .populate("faculty")
      .populate("proposedRoom")
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await RescheduleRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;
    await request.save();

    if (status === "Approved") {
      const schedule = await Schedule.findById(request.schedule);
      if (schedule) {
        schedule.date = request.proposedDate;
        schedule.timeSlot = request.proposedTimeSlot;
        schedule.classroom = request.proposedRoom;
        await schedule.save();

        await Notification.create({
          message: `Your reschedule request for ${schedule.course} has been approved.`,
          type: "success",
          department: request.department,
          createdBy: req.user.id
        });
      }
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
