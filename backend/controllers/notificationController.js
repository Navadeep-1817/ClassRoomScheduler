const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const { department, role } = req.user;
    
    // Base query: match user's department OR "ALL" departments
    let query = { $or: [{ department: "ALL" }, { department }] };

    // If the user varies (not Admin building it), filter by targetAudience
    if (["Coordinator", "Faculty", "Student"].includes(role)) {
      query.targetAudience = { $in: ["All", role] };
    }

    const notifications = await Notification.find(query)
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
    const { message, type, department, targetAudience } = req.body;
    const notification = await Notification.create({
      message,
      type: type || "info",
      department: department || "ALL",
      targetAudience: targetAudience || "All",
      createdBy: req.user.id
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
