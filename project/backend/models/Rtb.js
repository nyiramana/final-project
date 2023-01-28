const mongoose = require("mongoose");

const RtbSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      unique: true,
      required: [true, "Provide serial number of entered device"],
    },

    model: {
      type: String,
      required: [true, "provide model of this device"],
    },
    type: {
      type: String,
    },
    description: {
      type: String,
    },
    isSponsored: {
      type: Boolean,
      default: false,
    },
    sponsoredBy: String,
    registeredBy: {
      type: Object,
      required: true,
    },
    isTransfered: {
      type: Boolean,
      default: false,
    },

    transferedTo: Object,
    // {institution:reb,isReceived:true,receivedBy:Kamana}
    lifeSpan: {
      type: Number,
      default: 3,
    },
    institution: String,
    manufacturedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RTB", RtbSchema);
