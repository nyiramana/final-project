const mongoose = require("mongoose");

const SectorSchema = new mongoose.Schema({
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

    lowercase: true,
  },
  province: {
    type: String,
    lowercase: true,
    required: true,
  },
  district: {
    type: String,
    lowercase: true,
    required: true,
  },
  sector: {
    type: String,
    lowercase: true,
    required: true,
  },
  isTransfered: {
    type: Boolean,
    default: false,
  },
  transferedTo: Object,
  receivedDate: { type: Date, default: Date.now() },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Sector", SectorSchema);
