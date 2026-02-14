const mongoose = require("mongoose");


const connectDB = (URI) => {
  if (!URI) {
    throw new Error('MONGO_URI is not defined');
  }
  return mongoose.connect(URI).then(() =>
    console.log("MongoDB connected successfully")
  );
};

module.exports = connectDB;



