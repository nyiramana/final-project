const checkDestination = require("../helpers/checkDestination");
const ErrorResponse = require("../helpers/errorResponse");
const asyncHandler = require("../middleware/async");
const District = require("../models/District");
const Reb = require("../models/Reb");
const School = require("../models/School");
const ArchievedPc = require("../models/schoolMiscelanous/ArchievedPc");
const Damaged = require("../models/schoolMiscelanous/Damaged");
const RepairedPc = require("../models/schoolMiscelanous/RepairedPc");
const StolenPc = require("../models/schoolMiscelanous/StolenPc");

exports.registerDevice = asyncHandler(async (req, res, next) => {
  const user = {
    userId: req.user._id,
    names: `${req.user.firstname} ${req.user.lastname}`,
    email: req.user.email,
  };
  const institution = req.user.destination;

  const {
    serialNumber,
    name,
    model,
    type,
    lifeSpan,
    description,
    isSponsored,
    sponsoredBy,
    manufacturedDate,
  } = req.body;
  const pc = await Reb.create({
    serialNumber,
    model,
    type,
    description,
    isSponsored,
    sponsoredBy,
    registeredBy: user,
    lifeSpan,
    institution,
    manufacturedDate,
  });
  res.status(201).json({ message: "success", data: pc });
});

// display all pc in institution
exports.displayAllPc = asyncHandler(async (req, res, next) => {
  const result = [];

  const pcs = await Reb.find({ institution: "reb" });

  res.status(200).json({ message: "Data fetched", data: pcs });
});

exports.updateReb = asyncHandler(async (req, res, next) => {
  if (req.body.pcId) {
    return next(new ErrorResponse(`you're not allowed to update Pc ID`, 404));
  }
  const pc = await Reb.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!pc) {
    return next(
      new ErrorResponse(`pc with id: ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({
    message: `pc with id: ${req.params.id} has already updated`,
    data: pc,
  });
});

exports.getSinglePc = asyncHandler(async (req, res, next) => {
  const pc = await Reb.findById(req.params.id);
  if (!pc) {
    return next(
      new ErrorResponse(`pc with id: ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({ msg: "success", data: pc });
});

// send pc to district

exports.sendDeviceToDistrict = asyncHandler(async (req, res, next) => {
  const destination = checkDestination(req);
  const institution = destination.institution;

  const { pcId, province, district } = req.body;
  const destinationDistrict = District.find();
  // if (destinationDistrict.includes(district)) {
  const checkPcExist = await Reb.findOne({ _id: req.body.pcId });

  const transferedTo = {
    institution: institution,
    province,
    district,
    isReceived: false,
    receivedBy: "none",
    receivedDate: null,
  };
  if (checkPcExist && checkPcExist.isTransfered !== true) {
    await District.create({
      pcId,
      province,
      district,
      institution,
    })
      .then(async (pc) => {
        await checkPcExist.updateOne({
          isTransfered: true,
          isReceived: true,
          transferedTo,
        });
        res.status(201).json({ message: "success", data: pc });
      })
      .catch((e) => {
        return next(new ErrorResponse(e, 404));
      });
  } else {
    return next(
      new ErrorResponse(`pc with id: ${req.body.pcId} not found in Stock`, 404)
    );
  }
  // } else {
  //   return new ErrorResponse("district to send device is not found", 400);
  // }
});
exports.deletePc = asyncHandler(async (req, res, next) => {
  const pc = await Reb.deleteOne({
    _id: req.params.id,
    isTransfered: false,
  });
  if (!pc) {
    return next(
      new ErrorResponse(`pc with id: ${req.params.id} not found`, 404)
    );
  } else if (pc.deletedCount > 0) {
    res.status(200).json({
      message: "pc with id: " + req.params.id + " Has deleted",
      pc,
    });
  } else {
    return next(new ErrorResponse(`You can not delete transered device`, 400));
  }
});
// reports
exports.getWorkingPcInReb = asyncHandler(async (req, res, next) => {
  const pcs = await School.find({ institution: "reb", status: "working" });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails = await Reb.findOne({ _id: pcs[i].pcId });
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "all device Damaged", data: result });
});
exports.getDamagedPcInReb = asyncHandler(async (req, res, next) => {
  const pcs = await Damaged.find({ institution: "reb" });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails = await Reb.findOne({ _id: pcs[i].pcId });
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "all device Damaged", data: result });
});
exports.getArchievedPcInReb = asyncHandler(async (req, res, next) => {
  const pcs = await ArchievedPc.find({ institution: "reb" });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails = await Reb.findOne({ _id: pcs[i].pcId });
    result.push({ ...pcs[i]._doc, pcDetails });
  }

  res.status(200).json({ msg: "all  archieved devices", data: result });
});
exports.getStolenPcInReb = asyncHandler(async (req, res, next) => {
  const pcs = await StolenPc.find({ institution: "reb" });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails = await Reb.findOne({ _id: pcs[i].pcId });
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "all  Stolen devices", data: result });
});
exports.getRepairedPcInReb = asyncHandler(async (req, res, next) => {
  const pcs = await RepairedPc.find({ institution: "reb" }).populate({
    path: "technician",
    select: "techNames techEmail techPhone companyName address",
  });

  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails = await Reb.findOne({ _id: pcs[i].pcId });
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "all  Repaired devices", data: result });
});
