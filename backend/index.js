require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const courseRoutes = require("./routes/courseRoutes");
const classroomRoutes = require("./routes/classroomRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const importRoutes = require("./routes/importRoutes");
const rescheduleRoutes = require("./routes/rescheduleRoutes");

const app = express();
app.use(express.json());

const allowedOrigins = [
  process.env.FRONTEND_URL || "https://class-room-scheduler.vercel.app",
];

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser clients (Render health checks, curl, etc.)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/import", importRoutes);
app.use("/api/reschedules", rescheduleRoutes);

// Database Connection
if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI. Set it in backend environment variables.");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET. Set it in backend environment variables.");
  process.exit(1);
}

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    mongoConnected: mongoose.connection.readyState === 1
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
