const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    resource: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },

    metadata: {
      type: Object,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: "90d" },
    },
  },
  { timestamps: true },
);

auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });


const AuditLogModel = mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLogModel;