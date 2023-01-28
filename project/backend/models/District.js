const mongoose = require("mongoose");

const DistrictSchema = new mongoose.Schema({
  pcId: {
    type: String,
    unique: true,
    required: true,
  },
  institution: {
    type: String,
    lowercase: true,
    required: [true, "institution is required"],
  },
  province: {
    type: String,
    required: [true, "provide province"],
  },
  district: {
    type: String,
    lowercase: true,
    required: true,
  },
  isReceived: {
    type: Boolean,
    default: false,
  },
  receivedBy: Object,
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

module.exports = mongoose.model("District", DistrictSchema);
