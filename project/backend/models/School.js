const mongoose = require("mongoose");

const SchoolSchema = new mongoose.Schema({
  pcId: {
    type: String,
    unique: true,
    required: true,
  },
  isReceived: {
    type: Boolean,
    default: false,
  },
  receivedBy: Object,
  institution: {
    type: String,
    required: [true, "Specify institution belong to this machine"],
    lowercase: true,
  },
  province: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    lowercase: true,
    required: [true, "Provide district"],
  },
  sector: {
    type: String,
    lowercase: true,
    required: [true, "Provide sector"],
  },
  school: {
    type: String,
    lowercase: true,
    required: [true, "Provide school name"],
  },
  status: {
    type: String,
    enum: ["repaired", "working", "stolen", "archieved", "damaged"],
    default: "working",
  },
  receivedDate: { type: Date, default: Date.now() },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("School", SchoolSchema);
