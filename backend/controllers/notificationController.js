const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const { department } = req.user;
    // Return notifications matching the user's department OR global "ALL" notifications
    const notifications = await Notification.find({
      $or: [{ department: "ALL" }, { department }]
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("createdBy", "username role");
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { message, type, department } = req.body;
    const notification = await Notification.create({
      message,
      type: type || "info",
      department: department || "ALL",
      createdBy: req.user.id
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
