const checkDestination = require("../helpers/checkDestination");
const ErrorResponse = require("../helpers/errorResponse");
const asyncHandler = require("../middleware/async");
const District = require("../models/District");
const Reb = require("../models/Reb");
const Rtb = require("../models/Rtb");
const School = require("../models/School");
const ArchievedPc = require("../models/schoolMiscelanous/ArchievedPc");
const Damaged = require("../models/schoolMiscelanous/Damaged");
const RepairedPc = require("../models/schoolMiscelanous/RepairedPc");
const StolenPc = require("../models/schoolMiscelanous/StolenPc");
const Sector = require("../models/Sector");
const User = require("../models/User");

// receive pc on district

exports.receiveDev = asyncHandler(async (req, res, next) => {
  const user = {
    userId: req.user._id,
    names: `${req.user.firstname} ${req.user.lastname}`,
    email: req.user.email,
  };
  const destination = checkDestination(req);
  const receivedDate = new Date();
  const pc = await District.findByIdAndUpdate(
    req.params.id,
    { receivedDate, isReceived: true, receivedBy: user },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!pc) {
    return next(
      new ErrorResponse(`pc with id: ${req.params.id} not found`, 404)
    );
  }
  if (pc.institution == "reb") {
    const checkPcExist = await Reb.findOne({ _id: pc.pcId });
    let transferedToObj = checkPcExist.transferedTo;

    if (checkPcExist && checkPcExist.transferedTo.isReceived !== true) {
      transferedToObj["isReceived"] = true;
      transferedToObj["receivedBy"] = user;
      transferedToObj["receivedDate"] = receivedDate;
      await checkPcExist.updateOne({
        transferedTo: transferedToObj,
      });
      res.status(200).json({
        msg: `you received pc with id ${req.params.id} `,
      });
    }
    if (checkPcExist && checkPcExist.transferedTo.isReceived == true) {
      return next(
        new ErrorResponse(
          `pc with id: ${req.params.id} is Already received`,
          400
        )
      );
    }
    if (!checkPcExist) {
      return next(
        new ErrorResponse(
          `pc with id: ${req.params.id} is Not Found in Stock`,
          404
        )
      );
    }
  }
  if (pc.institution == "rtb") {
    const checkPcExist = await Rtb.findOne({ _id: pc.pcId });
    let transferedToObj = checkPcExist.transferedTo;

    if (checkPcExist && checkPcExist.transferedTo.isReceived !== true) {
      transferedToObj["receivedBy"] = user;
      transferedToObj["isReceived"] = true;
      transferedToObj["receivedDate"] = receivedDate;
      await checkPcExist.updateOne({
        transferedTo: transferedToObj,
      });
      res.status(200).json({
        msg: `you received pc with id ${req.params.id} `,
      });
    }
    if (checkPcExist && checkPcExist.transferedTo.isReceived == true) {
      return next(
        new ErrorResponse(
          `pc with id: ${req.params.id} is Already received`,
          400
        )
      );
    }
    if (!checkPcExist) {
      return next(
        new ErrorResponse(
          `pc with id: ${req.params.id} is Not Found in Stock`,
          404
        )
      );
    }
  } else {
    return next(new ErrorResponse("Please check your institution", 400));
  }
});

// get all registered district
exports.displayAllPc = asyncHandler(async (req, res, next) => {
  const destination = checkDestination(req);

  const district = destination.district;
  const result = [];

  const pcs = await District.find({ district });

  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }

  res.status(200).json({ message: "Data fetched", data: result });
});

// get single district by id

exports.getSinglePCinDistrict = asyncHandler(async (req, res, next) => {
  const district = await District.findById(req.params.id);
  if (!district) {
    return next(
      new ErrorResponse(`district with id: ${req.params.id} not found`, 404)
    );
  }

  if (district.institution === "reb") {
    let result = [];
    const pcDetails = await Reb.findOne({ _id: district.pcId });
    result.push({ ...district._doc, pcDetails });
    res.status(200).json({ message: "success", data: result });
  }

  if (district.institution === "rtb") {
    let result = [];
    const pcDetails = await Rtb.findOne({ _id: district.pcId });
    result.push({ ...district._doc, pcDetails });
    res.status(200).json({ message: "success", data: result });
  }
  if (district.institution !== "rtb" || district.institution !== "reb") {
    return next(
      new ErrorResponse(
        `institution must be rtb or reb not ${district.institution}`,
        404
      )
    );
  }
});

exports.updateDistrictPc = asyncHandler(async (req, res, next) => {
  const district = await District.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!district) {
    return next(
      new ErrorResponse(`district with id: ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({
    message: `district with id: ${req.params.id} has already updated`,
    data: district,
  });
});

exports.sendDeviceToSector = asyncHandler(async (req, res, next) => {
  // const destination = checkDestination(req);
  // const district = destination.district;
  const destinationSector = User.find();
  const { pcId, sector } = req.body;
  // if (destinationSector.includes(sector)) {
  const checkPcExist = await District.findOne({ pcId, isTransfered: false });

  if (checkPcExist) {
    const institution = checkPcExist.institution;
    const province = checkPcExist.province;
    const district = checkPcExist.district;

    const transferedTo = {
      institution,
      province,
      district,
      sector,
      isReceived: false,
      receivedBy: "none",
      receivedDate: null,
    };
    await Sector.create({
      pcId,
      sector,
      district,
      province,
      institution,
    })
      .then(async (pc) => {
        await checkPcExist.updateOne({
          isTransfered: true,
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
  //   return next(new ErrorResponse("Destination not found", 400));
  // }
});

// reports

exports.getWorkingPcInDistrict = asyncHandler(async (req, res) => {
  const destination = checkDestination(req);

  const district = destination.district;
  const pcs = await School.find({ district, status: "working" });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res
    .status(200)
    .json({ msg: "report of working devices in district", data: result });
});

exports.getDamagedPcInDistrict = asyncHandler(async (req, res) => {
  const destination = checkDestination(req);

  const district = destination.district;
  const pcs = await Damaged.find({ district });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res
    .status(200)
    .json({ msg: "report of damaged pc in district", data: result });
});
exports.getRepairedPcInDistrict = asyncHandler(async (req, res) => {
  const destination = checkDestination(req);

  const district = destination.district;
  const pcs = await RepairedPc.find({ district }).populate({
    path: "technician",
    select: "techNames techEmail techPhone companyName address",
  });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res
    .status(200)
    .json({ msg: "report of repaired pc in district", data: result });
});
exports.getStolenPcInDistrict = asyncHandler(async (req, res) => {
  const destination = checkDestination(req);

  const district = destination.district;
  const pcs = await StolenPc.find({ district });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res
    .status(200)
    .json({ msg: "report of Stolen pc in district", data: result });
});
exports.getArchievedPcInDistrict = asyncHandler(async (req, res) => {
  const destination = checkDestination(req);

  const district = destination.district;
  const pcs = await ArchievedPc.find({ district });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res
    .status(200)
    .json({ msg: "report of archieved pc in district", data: result });
});
