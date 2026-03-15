const logger = require("../config/logger");

const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = stream;
