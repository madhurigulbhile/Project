/* models/User.js */
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  field: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    default: "user"
  },
  experience: {
    type: String,
    default: ""
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);