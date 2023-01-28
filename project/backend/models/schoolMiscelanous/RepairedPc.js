const mongoose = require("mongoose");

const RepairedPcSchema = new mongoose.Schema({
  pcId: {
    type: String,
    required: true,
  },
  institution: {
    type: String,
    required: [true, "Specify institution belong to this machine"],
    lowercase: true,
  },
  province: {
    type: String,
    required: [true, "Provide province"],
  },
  district: {
    type: String,
    required: [true, "Provide district"],
  },
  sector: {
    type: String,
    required: [true, "Provide sector"],
  },
  school: {
    type: String,
    required: [true, "Provide school name"],
  },
  repairedDate: {
    type: Date,
    default: Date.now(),
    // required: true,
  },
  technician: {
    type: mongoose.Schema.ObjectId,
    ref: "Technician",

    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Repaired", RepairedPcSchema);
