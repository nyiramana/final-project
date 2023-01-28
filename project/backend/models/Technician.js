const mongoose = require("mongoose");

const TechnicianSchema = new mongoose.Schema({
  techNames: {
    type: String,
    required: true,
  },
  techEmail: {
    type: String,
  },
  techPhone: {
    type: String,
    maxLength: 10,
  },
  companyName: {
    type: String,
    required: true,
  },
  address: String,
});

module.exports = mongoose.model("Technician", TechnicianSchema);
