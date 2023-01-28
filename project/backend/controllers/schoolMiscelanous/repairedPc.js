const checkDestination = require("../../helpers/checkDestination");
const ErrorResponse = require("../../helpers/errorResponse");
const asyncHandler = require("../../middleware/async");
const Reb = require("../../models/Reb");
const Rtb = require("../../models/Rtb");

const RepairedPc = require("../../models/schoolMiscelanous/RepairedPc");

exports.getRepairedPc = asyncHandler(async (req, res, next) => {
  const destination = checkDestination(req);

  const school = destination.school;
  const sector = destination.sector;
  const district = destination.district;

  const pcs = await RepairedPc.find({ school, sector, district }).populate({
    path: "technician",
    select: "techNames techEmail techPhone companyName address",
  });
  const result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "Success", data: result });
});

exports.getOneRepairedPc = asyncHandler(async (req, res, next) => {
  const pc = await RepairedPc.findById(req.params.id);
  if (!pc) {
    return next(
      new ErrorResponse(`Pc with is ${req.params.id} is not archieved`, 400)
    );
  }
  res.status(200).json({ msg: "success", data: pc });
});
exports.updateRepairedPc = asyncHandler(async (req, res, next) => {
  const { description, repairedDate } = req.body;
  if (description || repairedDate) {
    const pc = await RepairedPc.findByIdAndUpdate(
      req.params.id,
      { description, repairedDate },
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
    res.status(200).json({ msg: "updated!!", data: pc });
  } else {
    return next(
      new ErrorResponse(
        `you're only allowed to update description or date`,
        400
      )
    );
  }
});
