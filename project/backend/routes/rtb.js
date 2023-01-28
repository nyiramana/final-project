const {
  displayAllPc,
  getSinglePc,
  updateRtb,
  sendDeviceToDistrict,
  registerDevice,
  deletePc,
  getDamagedPcInRtb,
  getArchievedPcInRtb,
  getStolenPcInRtb,
  getRepairedPcInRtb,
  getWorkingPcInRtb,
} = require("../controllers/rtb");
const { protect, authorize } = require("../middleware/auth");

const router = require("express").Router();

router.use(protect);

router
  .route("/")
  .get(authorize("rtb"), displayAllPc)
  .post(authorize("rtb"), registerDevice);
router
  .route("/:id")
  .put(authorize("rtb"), updateRtb)
  .get(authorize("rtb"), getSinglePc)
  .delete(authorize("rtb"), deletePc);

router.route("/sendDevice").post(authorize("rtb"), sendDeviceToDistrict);
// reports
router.route("/report/working").get(authorize("rtb"), getWorkingPcInRtb);
router.route("/report/damaged").get(authorize("rtb"), getDamagedPcInRtb);
router.route("/report/archieved").get(authorize("rtb"), getArchievedPcInRtb);
router.route("/report/stolen").get(authorize("rtb"), getStolenPcInRtb);
router.route("/report/repaired").get(authorize("rtb"), getRepairedPcInRtb);

module.exports = router;
