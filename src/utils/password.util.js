const bcrypt = require("bcrypt");

exports.hashPassword = async (password) => await bcrypt.hash(password, 12);


exports.comparePassword = async (plain, hashed) => await bcrypt.compare(plain, hashed);

