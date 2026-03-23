require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/auth.model");
const { hashPassword } = require("../utils/password.util");

const MONGO_URI = process.env.MONGO_URI;

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("DB connected");

    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    const password = await hashPassword(process.env.ADMIN_PASSWORD);

    const admin = await User.create({
      name: "super admin",
      email: process.env.ADMIN_EMAIL,
      password,
      role: "admin",
      isVerified: true,
    });

    console.log("Admin seeded:", admin);
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(); 
  }
}

seedAdmin();
