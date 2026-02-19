const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, 
    },
  },
  { timestamps: true }
);

const RefreshTokenModel = mongoose.model("RefreshToken", tokenSchema);
module.exports = RefreshTokenModel;