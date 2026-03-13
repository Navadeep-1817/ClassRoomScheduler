/**
 * Seed demo users for production deployment
 * Run this script to create demo accounts:
 * node seedDemoUsers.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Faculty = require("./models/Faculty");
const Student = require("./models/Student");

const demoUsers = [
  {
    username: "admin",
    password: "Admin@123",
    role: "Admin",
    department: null,
    name: "System Administrator"
  },
  {
    username: "coord_cse",
    password: "Coord@123",
    role: "Coordinator",
    department: "CSE",
    name: "CSE Coordinator"
  },
  {
    username: "fac_john",
    password: "Faculty@123",
    role: "Faculty",
    department: "CSE",
    name: "John Smith"
  },
  {
    username: "stu_cse_01",
    password: "Student@123",
    role: "Student",
    department: "CSE",
    name: "Alice Johnson"
  }
];

async function seedUsers() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("Error: MONGO_URI is not set in environment variables.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    console.log("\nSeeding demo users...");

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ username: userData.username });
      
      if (existingUser) {
        console.log(`✓ User ${userData.username} (${userData.role}) already exists`);
        
        // Update password to ensure it matches demo credentials
        const salt = await bcrypt.genSalt(10);
        existingUser.password = await bcrypt.hash(userData.password, salt);
        await existingUser.save();
        console.log(`  Updated password for ${userData.username}`);
        
        // Create/update associated Faculty/Student records
        if (userData.role === "Faculty") {
          const existingFaculty = await Faculty.findOne({ user: existingUser._id });
          if (!existingFaculty) {
            await Faculty.create({
              name: userData.name,
              department: userData.department,
              user: existingUser._id
            });
            console.log(`  Created Faculty record for ${userData.username}`);
          }
        }
        
        if (userData.role === "Student") {
          const existingStudent = await Student.findOne({ user: existingUser._id });
          if (!existingStudent) {
            await Student.create({
              name: userData.name,
              department: userData.department,
              user: existingUser._id
            });
            console.log(`  Created Student record for ${userData.username}`);
          }
        }
        
        continue;
      }

      // Create new user
      const user = await User.create({
        username: userData.username,
        password: userData.password,
        role: userData.role,
        department: userData.department
      });

      console.log(`✓ Created user ${userData.username} (${userData.role})`);

      // Create associated Faculty record
      if (userData.role === "Faculty") {
        await Faculty.create({
          name: userData.name,
          department: userData.department,
          user: user._id
        });
        console.log(`  Created Faculty record`);
      }

      // Create associated Student record
      if (userData.role === "Student") {
        await Student.create({
          name: userData.name,
          department: userData.department,
          user: user._id
        });
        console.log(`  Created Student record`);
      }
    }

    console.log("\n✅ Demo users seeded successfully!");
    console.log("\nDemo Credentials:");
    console.log("─────────────────────────────────────────");
    demoUsers.forEach(u => {
      console.log(`${u.role.padEnd(13)} | ${u.username.padEnd(12)} | ${u.password}`);
    });
    console.log("─────────────────────────────────────────");

  } catch (error) {
    console.error("\n❌ Error seeding users:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed.");
    process.exit(0);
  }
}

seedUsers();
