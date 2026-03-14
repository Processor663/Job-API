require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/auth.model");
const { hashPassword } = require("../utils/password.util");

const MONGO_URI = process.env.MONGO_URI;
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit();
    }

    const password = await hashPassword(process.env.ADMIN_PASSWORD); // default admin password

    const admin = await User.create({
      name: "super admin",
      email: process.env.ADMIN_EMAIL,
      password,
      role: "admin",
      isVerified: true,
    });

    console.log("Admin seeded:", admin);
    process.exit();
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
