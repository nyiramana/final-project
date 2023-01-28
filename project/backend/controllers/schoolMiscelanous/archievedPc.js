const checkDestination = require("../../helpers/checkDestination");
const ErrorResponse = require("../../helpers/errorResponse");
const asyncHandler = require("../../middleware/async");
const Reb = require("../../models/Reb");
const Rtb = require("../../models/Rtb");
const ArchievedPc = require("../../models/schoolMiscelanous/ArchievedPc");

exports.getArchievedPc = asyncHandler(async (req, res, next) => {
  const destination = checkDestination(req);

  const school = destination.school;
  const sector = destination.sector;
  const district = destination.district;
  const pcs = await ArchievedPc.find({ school, sector, district });

  const result = [];
  for (let i = 0; i < pcs.length; i++) {
    const pcDetails =
      (await Reb.findOne({ _id: pcs[i].pcId })) ||
      (await Rtb.findOne({ _id: pcs[i].pcId }));
    result.push({ ...pcs[i]._doc, pcDetails });
  }

  res.status(200).json({ msg: "Success", data: result });
});
exports.getOneArchieved = asyncHandler(async (req, res, next) => {
  const pc = await ArchievedPc.findById(req.params.id);
  if (!pc) {
    return next(
      new ErrorResponse(`Pc with is ${req.params.id} is not archieved`, 400)
    );
  }
  res.status(200).json({ msg: "success", data: pc });
});
exports.updateArchieved = asyncHandler(async (req, res, next) => {
  const { description, archievedDate } = req.body;
  if (description || archievedDate) {
    const pc = await ArchievedPc.findByIdAndUpdate(
      req.params.id,
      { description, archievedDate },
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
