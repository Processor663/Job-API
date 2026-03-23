require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/auth.model");
const { hashPassword } = require("../utils/password.util");
const logger = require("../config/logger");


const MONGO_URI = process.env.MONGO_URI;
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => {
    console.error("DB connection error:", err);
    logger.error("DB connection error for seedAdmin", { error: err.message, stack: err.stack });
    process.exit(1);
  });

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });
    if (existingAdmin) {
      console.log("Admin user already exists");
      logger.info("Admin user already exists", { email: process.env.ADMIN_EMAIL });
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

    logger.info("Admin seeded", { email: process.env.ADMIN_EMAIL });
    process.exit();
  } catch (error) {
    logger.error("Error seeding admin", { error: error.message, stack: error.stack });
    process.exit(1);
  } finally {
    await mongoose.disconnect(); 
    process.exit(); 
  } 
};

seedAdmin();


