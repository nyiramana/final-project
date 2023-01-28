const asyncHandler = require("../middleware/async");
const District = require("../models/District");
const Sector = require("../models/Sector");
const checkDestination = require("../helpers/checkDestination");
const ErrorResponse = require("../helpers/errorResponse");
const School = require("../models/School");
const Reb = require("../models/Reb");
const Rtb = require("../models/Rtb");
const Damaged = require("../models/schoolMiscelanous/Damaged");
const RepairedPc = require("../models/schoolMiscelanous/RepairedPc");
const StolenPc = require("../models/schoolMiscelanous/StolenPc");
const ArchievedPc = require("../models/schoolMiscelanous/ArchievedPc");
const User = require("../models/User");

// register pc on sector
exports.receiveDevice = asyncHandler(async (req, res, next) => {
  const user = {
    userId: req.user._id,
    names: `${req.user.firstname} ${req.user.lastname}`,
    email: req.user.email,
  };

  const receivedDate = new Date();

  const pc = await Sector.findByIdAndUpdate(
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
  const checkPcExist = await District.findOne({ pcId: pc.pcId });
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
      new ErrorResponse(`pc with id: ${req.params.id} is Already received`, 400)
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
});

// get all registered sector
exports.displayAllPc = asyncHandler(async (req, res, next) => {
  const destination = checkDestination(req);

  const sector = destination.sector;
  const district = destination.district;
  const result = [];

  const pcs = await Sector.find({ sector, district });
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }

  res.status(200).json({ message: "Data fetched", data: result });
});

// get single pc by id

exports.getSinglePCinSector = asyncHandler(async (req, res, next) => {
  const pc = await Sector.findById(req.params.id);
  if (!pc) {
    return next(
      new ErrorResponse(`device with id: ${req.params.id} not found`, 404)
    );
  }

  if (pc.institution === "reb") {
    let result = [];
    const pcDetails = await Reb.findOne({ _id: pc.pcId });
    result.push({ ...pc._doc, pcDetails });
    res.status(200).json({ message: "success", data: result });
  }

  if (pc.institution === "rtb") {
    let result = [];
    const pcDetails = await Rtb.findOne({ _id: pc.pcId });
    result.push({ ...pc._doc, pcDetails });
    res.status(200).json({ message: "success", data: result });
  }
  if (pc.institution !== "rtb" || pc.institution !== "reb") {
    return next(
      new ErrorResponse(
        `institution must be rtb or reb not ${pc.institution}`,
        404
      )
    );
  }
});

exports.updateSectorPc = asyncHandler(async (req, res, next) => {
  if (req.body.pcId) {
    return next(new ErrorResponse(`you're not allowed to edit Pc ID`, 400));
  }
  const sector = await Sector.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!sector) {
    return next(
      new ErrorResponse(`sector with id: ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({
    message: `sector with id: ${req.params.id} has already updated`,
    data: sector,
  });
});

exports.sendDeviceToSchool = asyncHandler(async (req, res, next) => {
  const { pcId, school } = req.body;
  const userDest = await User.find();
  const userdester = userDest.find((item) =>
    item.destination.includes(school.toLowerCase())
  );
  if (userdester) {
    const checkPcExist = await Sector.findOne({ pcId, isTransfered: false });
    if (checkPcExist) {
      const institution = checkPcExist.institution;
      const province = checkPcExist.province;
      const district = checkPcExist.district;
      const sector = checkPcExist.sector;
      const transferedTo = {
        institution,
        province,
        district,
        sector,
        school,
        isReceived: false,
        receivedBy: "none",
        receivedDate: null,
      };
      await School.create({
        pcId,
        school,
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
        new ErrorResponse(
          `pc with id: ${req.body.pcId} not found in Stock`,
          404
        )
      );
    }
  } else {
    return next(
      new ErrorResponse(
        "Please your inputted school doesn't match anything please specify the name of registered school!!!",
        400
      )
    );
  }
});

// reports

exports.getWorkingPcInSector = asyncHandler(async (req, res) => {
  const destination = checkDestination(req);

  const sector = destination.sector;
  const pcs = await School.find({ sector, status: "working" });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "report of woking pc in sector", data: result });
});
exports.getDamagedPcInSector = asyncHandler(async (req, res) => {
  const destination = checkDestination(req);

  const sector = destination.sector;
  const pcs = await Damaged.find({ sector });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "report of damaged pc in sector", data: result });
});
exports.getRepairedPcInSector = asyncHandler(async (req, res) => {
  const destination = checkDestination(req);

  const sector = destination.sector;
  const pcs = await RepairedPc.find({ sector }).populate({
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
    .json({ msg: "report of repaired pc in sector", data: result });
});
exports.getStolenPcInSector = asyncHandler(async (req, res) => {
  const destination = checkDestination(req);

  const sector = destination.sector;
  const pcs = await StolenPc.find({ sector });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "report of Stolen pc in sector", data: result });
});
exports.getArchievedPcInSector = asyncHandler(async (req, res) => {
  const destination = checkDestination(req);

  const sector = destination.sector;
  const pcs = await ArchievedPc.find({ sector });
  let result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res
    .status(200)
    .json({ msg: "report of archieved pc in sector", data: result });
});
