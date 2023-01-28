const checkDestination = require("../../helpers/checkDestination");
const ErrorResponse = require("../../helpers/errorResponse");
const asyncHandler = require("../../middleware/async");
const Reb = require("../../models/Reb");
const Rtb = require("../../models/Rtb");

const StolenPc = require("../../models/schoolMiscelanous/StolenPc");

exports.getStolenPc = asyncHandler(async (req, res, next) => {
  const destination = checkDestination(req);

  const school = destination.school;
  const sector = destination.sector;
  const district = destination.district;

  const pcs = await StolenPc.find({ school, sector, district });
  const result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }
  res.status(200).json({ msg: "Success", data: result });
});

exports.getOneStolenPc = asyncHandler(async (req, res, next) => {
  const pc = await StolenPc.findById(req.params.id);
  if (!pc) {
    return next(
      new ErrorResponse(`Pc with is ${req.params.id} is not archieved`, 400)
    );
  }
  res.status(200).json({ msg: "success", data: pc });
});
exports.updateStolenPc = asyncHandler(async (req, res, next) => {
  const { description, stolenDate } = req.body;
  if (description || stolenDate) {
    const pc = await StolenPc.findByIdAndUpdate(
      req.params.id,
      { description, stolenDate },
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
