const bcrypt = require("bcrypt");

exports.hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

exports.comparePassword = async (plain, hashed) => {
  return bcrypt.compare(plain, hashed);
};
