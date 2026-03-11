const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["refreshToken", "emailVerification", "passwordReset"],
      default: "refreshToken",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // index: { expires: 0 },
    },
  },
  { timestamps: true },
);

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ userId: 1, type: 1 });

const TokenModel = mongoose.model("RefreshToken", tokenSchema);
module.exports = TokenModel;
