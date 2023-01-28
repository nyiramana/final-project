const asyncHandler = require("../middleware/async");

const ErrorResponse = require("../helpers/errorResponse");
const checkDestination = require("../helpers/checkDestination");
const School = require("../models/School");
const Sector = require("../models/Sector");
const Reb = require("../models/Reb");
const Rtb = require("../models/Rtb");
const Damaged = require("../models/schoolMiscelanous/Damaged");
const ArchievedPc = require("../models/schoolMiscelanous/ArchievedPc");
const StolenPc = require("../models/schoolMiscelanous/StolenPc");
const RepairedPc = require("../models/schoolMiscelanous/RepairedPc");
const Technician = require("../models/Technician");

exports.receiveDevice = asyncHandler(async (req, res, next) => {
  const user = {
    userId: req.user._id,
    names: `${req.user.firstname} ${req.user.lastname}`,
    email: req.user.email,
  };
  const receivedDate = new Date();

  const pc = await School.findByIdAndUpdate(req.params.id, {
    receivedDate,
    isReceived: true,
    receivedBy: user,
  });

  if (!pc) {
    return next(
      new ErrorResponse(`pc with id: ${req.params.id} not found`, 404)
    );
  }
  const checkPcExist = await Sector.findOne({ pcId: pc.pcId });
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

// get all registered school
exports.displayAllPc = asyncHandler(async (req, res, next) => {
  const destination = checkDestination(req);

  const school = destination.school;
  const sector = destination.sector;
  const district = destination.district;
  const result = [];

  const pcs = await School.find({ school, sector, district });
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }

  res.status(200).json({ message: "Data fetched", data: result });
});

// get single pc by id

exports.getSinglePCinSchool = asyncHandler(async (req, res, next) => {
  const school = await School.findById(req.params.id);
  if (!school) {
    return next(
      new ErrorResponse(`pc with id: ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({ message: "success", data: school });
});

exports.updateSchoolPc = asyncHandler(async (req, res, next) => {
  const {
    status,
    description,
    techNames,
    techEmail,
    techPhone,
    companyName,
    address,
  } = req.body;

  if (status === "stolen") {
    await School.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .then(async (resp) => {
        const { pcId, institution, province, school, district, sector, date } =
          resp;
        await StolenPc.create({
          pcId,
          institution,
          province,
          district,
          sector,
          school,
          description,
          stolenDate: date,
        });
        res.status(200).json({
          message: `school with id: ${req.params.id} has updated`,
          data: resp,
        });
      })
      .catch((err) => {
        if (err.code == "11000") {
          return next(new ErrorResponse(`this device is already stolen`, 404));
        }
      });
  }
  if (status === "working") {
    await School.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .then((resp) => {
        res.status(200).json({
          message: `school with id: ${req.params.id} has updated`,
          data: resp,
        });
      })
      .catch((err) => {
        return next(new ErrorResponse(`${err}`, 404));
      });
  }

  if (status === "damaged") {
    await School.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .then(async (resp) => {
        const { pcId, institution, province, school, district, sector, date } =
          resp;
        await Damaged.create({
          pcId,
          institution,
          province,
          district,
          sector,
          school,
          description,
          damagedDate: date,
        });
        res.status(200).json({
          message: `school with id: ${req.params.id} has updated`,
          data: resp,
        });
      })
      .catch((err) => {
        return next(new ErrorResponse(`${err}`, 404));
      });
  }

  if (status === "archieved") {
    await School.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .then(async (resp) => {
        const { pcId, institution, province, school, district, sector, date } =
          resp;

        await ArchievedPc.create({
          pcId,
          institution,
          province,
          district,
          sector,
          school,
          description,
          archievedDate: date,
        });
        res.status(200).json({
          message: `school with id: ${req.params.id} has updated`,
          data: resp,
        });
      })
      .catch((err) => {
        return next(new ErrorResponse(`${err}`, 404));
      });
  }
  if (status === "repaired") {
    await School.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .then(async (resp) => {
        const { pcId, institution, province, school, district, sector, date } =
          resp;

        const { techNames, techEmail, techPhone, companyName, address } =
          req.body;
        const tech = await Technician.create({
          techNames,
          techEmail,
          techPhone,
          companyName,
          address,
        });
        const uptd = await RepairedPc.create({
          pcId,
          institution,
          province,
          district,
          sector,
          school,
          description,
          technician: tech._id,
          repairedDate: date,
        });

        if (uptd && tech) {
          res.status(200).json({
            message: `school with id: ${req.params.id} has updated`,
            data: resp,
          });
        }
      })
      .catch((err) => {
        return next(new ErrorResponse(` ${err}`, 400));
      });
  }
});
exports.getWorkingPc = asyncHandler(async (req, res, next) => {
  const destination = checkDestination(req);

  const school = destination.school;

  const pcs = await School.find({
    status: "working",
    school,
    isReceived: "true",
  });
  const result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "success", data: result });
});

exports.getTech = asyncHandler(async (req, res, next) => {
  const tech = await Technician.find();
  res.status(200).json({ msg: "success", data: tech });
});

exports.getSingleTechPc = asyncHandler(async (req, res, next) => {
  const tech = await Technician.findById(req.params.id);
  if (!tech) {
    return next(
      new ErrorResponse(`Technician with is ${req.params.id} is not found`, 400)
    );
  }
  res.status(200).json({ msg: "success", data: tech });
});
exports.updateTech = asyncHandler(async (req, res, next) => {
  const tech = await Technician.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tech) {
    return next(
      new ErrorResponse(`Technician with is ${req.params.id} is not found`, 404)
    );
  }
  res.status(200).json({ msg: "updated!!", data: tech });
});
