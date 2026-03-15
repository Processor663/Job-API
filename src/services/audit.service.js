const AuditLog = require("../models/auditLog.model");
const logger = require("../config/logger");

exports.logAudit = async ({
  userId,
  action,
  ipAddress,
  userAgent,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      userId,
      action,
      ipAddress,
      userAgent,
      metadata,
    });

    logger.info("Audit event recorded", { userId, action });
  } catch (error) {
    logger.error("Audit log failed", {
      error: error.message,
      action,
      userId,
    });
  }
};
