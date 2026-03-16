const morgan = require("morgan");
const stream = require("../utils/stream");

const requestLogger = morgan(
  ":method :url :status :response-time ms - :res[content-length]",
  { stream },
);
module.exports = requestLogger;