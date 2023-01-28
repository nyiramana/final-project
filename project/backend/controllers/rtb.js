const asyncHandler = require("../middleware/async");
const Rtb = require("../models/Rtb");

const ErrorResponse = require("../helpers/errorResponse");
const checkDestination = require("../helpers/checkDestination");
const District = require("../models/District");
const Damaged = require("../models/schoolMiscelanous/Damaged");
const ArchievedPc = require("../models/schoolMiscelanous/ArchievedPc");
const StolenPc = require("../models/schoolMiscelanous/StolenPc");
const RepairedPc = require("../models/schoolMiscelanous/RepairedPc");
const School = require("../models/School");

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
  const pc = await Rtb.create({
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

// display all pc in rtb
exports.displayAllPc = asyncHandler(async (req, res, next) => {
  const result = [];

  const pcs = await Rtb.find({ institution: "rtb" });

  res.status(200).json({ message: "Data fetched", data: pcs });
});

exports.updateRtb = asyncHandler(async (req, res, next) => {
  if (req.body.pcId) {
    return next(new ErrorResponse(`you're not allowed to edit Pc ID`, 400));
  }
  const pc = await Rtb.findByIdAndUpdate(req.params.id, req.body, {
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
  const pc = await Rtb.findById(req.params.id);
  if (!pc) {
    return next(
      new ErrorResponse(`pc with id: ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({ message: "success", data: pc });
});
exports.deletePc = asyncHandler(async (req, res, next) => {
  const pc = await Rtb.deleteOne({
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
    return next(new ErrorResponse(`You can not delete transered Pc`, 400));
  }
});

exports.sendDeviceToDistrict = asyncHandler(async (req, res, next) => {
  const destination = checkDestination(req);
  const institution = destination.institution;

  const { pcId, province, district } = req.body;

  const destinationDistrict = District.find();
  // if (destinationDistrict.includes(district)) {
  const checkPcExist = await Rtb.findOne({ _id: req.body.pcId });

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
  //   return new ErrorResponse("district not found", 400);
  // }
});

// reports
exports.getWorkingPcInRtb = asyncHandler(async (req, res, next) => {
  const pcs = await School.find({ institution: "rtb", status: "working" });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails = await Rtb.findOne({ _id: pcs[i].pcId });
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "all Working devices", data: result });
});

exports.getDamagedPcInRtb = asyncHandler(async (req, res, next) => {
  const pcs = await Damaged.find({ institution: "rtb" });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails = await Rtb.findOne({ _id: pcs[i].pcId });
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "all device Damaged", data: result });
});
exports.getArchievedPcInRtb = asyncHandler(async (req, res, next) => {
  const pcs = await ArchievedPc.find({ institution: "rtb" });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails = await Rtb.findOne({ _id: pcs[i].pcId });
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "all  archieved devices", data: result });
});
exports.getStolenPcInRtb = asyncHandler(async (req, res, next) => {
  const pcs = await StolenPc.find({ institution: "rtb" });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails = await Rtb.findOne({ _id: pcs[i].pcId });
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "all  Stolen devices", data: result });
});
exports.getRepairedPcInRtb = asyncHandler(async (req, res, next) => {
  const pcs = await RepairedPc.find({ institution: "rtb" }).populate({
    path: "technician",
    select: "techNames techEmail techPhone companyName address",
  });

  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails = await Rtb.findOne({ _id: pcs[i].pcId });
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "all  Repaired devices", data: result });
});
