const { morgan } = require("morgan");
const { stream } = require("../utils/stream.js");

exports.requestLogger = morgan(
  ":method :url :status :response-time ms - :res[content-length]",
  { stream },
);
