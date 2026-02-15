const express = require("express");
const app = express();

require("dotenv").config();
const cookieParser = require('cookie-parser');

// connectDB
const connectDB = require("./src/config/connectDB");

// auth routes
const authRoutes = require("./src/routes/auth.routes");

const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const PORT = process.env.PORT || 3500;



// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use('/api/v1/auth', authRoutes)






// Catch-all for this router only
// app.use((req, res) => {
//   res.status(404).json({ message: "Route not found" });
// });



const serverStart = async () => {
  try {
    // Connect to DB
    await connectDB(process.env.MONGO_URI)
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting...", error);
    process.exit(1)
  }
};

// Start server
serverStart();