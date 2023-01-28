const checkDestination = require("../../helpers/checkDestination");
const asyncHandler = require("../../middleware/async");
const Reb = require("../../models/Reb");
const Rtb = require("../../models/Rtb");
const Damaged = require("../../models/schoolMiscelanous/Damaged");

exports.getDamagedPc = asyncHandler(async (req, res, next) => {
  const destination = checkDestination(req);

  const school = destination.school;
  const sector = destination.sector;
  const district = destination.district;
  const pcs = await Damaged.find({ school, sector, district });
  const result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }

  res.status(200).json({ msg: "Success", data: result });
});

exports.getOneDamaged = asyncHandler(async (req, res, next) => {
  const pc = await Damaged.findById(req.params.id);
  if (!pc) {
    return next(
      new ErrorResponse(`Pc with is ${req.params.id} is not archieved`, 400)
    );
  }
  res.status(200).json({ msg: "success", data: pc });
});
exports.updateDamaged = asyncHandler(async (req, res, next) => {
  const { description, damagedDate } = req.body;
  if (description || damagedDate) {
    const pc = await Damaged.findByIdAndUpdate(
      req.params.id,
      { description, damagedDate },
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
