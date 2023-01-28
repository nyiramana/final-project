const mongoose = require("mongoose");

const RebSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      unique: true,
      required: [true, "Provide serial number of entered device"],
    },
    model: {
      type: String,
      required: [true, "provide model of this device"],
      // example: hp, positivo, compac...
    },
    type: {
      type: String,
      // example:  laptop ,desktop
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
      required: [
        true,
        "You have to provide user details who register this device",
      ],
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
      required: [true, "Please provide life span of this device"],
    },
    institution: String,
    manufacturedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("REB", RebSchema);
