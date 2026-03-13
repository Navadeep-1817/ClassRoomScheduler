const Faculty = require("../models/Faculty");

exports.getFaculty = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "Coordinator") {
      query.department = req.user.department;
    }
    const faculty = await Faculty.find(query).populate("subjects");
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.create(req.body);
    res.status(201).json(faculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
