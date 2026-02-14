const express = require("express");
const User = require("../models/auth.model");

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }
  await User.create({ name, email, password });
  console.log("registration successful");
//   return user;
};

module.exports = { register };
