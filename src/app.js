const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;



const start = async () => {
  app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
  });
};
start();
