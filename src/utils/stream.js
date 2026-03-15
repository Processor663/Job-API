const { logger } = require("../config/logger");

{logger.info("Stream initialized") }


module.exports = {
  write: (message) => {
    logger.info(message.trim());
  },
};
