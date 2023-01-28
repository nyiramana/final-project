const {
  getSinglePCinDistrict,
  displayAllPc,
  updateDistrictPc,
  receiveDev,
  sendDeviceToSector,
  getDamagedPcInDistrict,
  getRepairedPcInDistrict,
  getStolenPcInDistrict,
  getArchievedPcInDistrict,
  getWorkingPcInDistrict,
} = require("../controllers/district");
const { protect, authorize } = require("../middleware/auth");
const router = require("express").Router();
router.use(protect);

router.route("/").get(displayAllPc);
router
  .route("/:id")
  .get(getSinglePCinDistrict)
  .put(authorize("district"), updateDistrictPc);
router.route("/receivedevice/:id").put(authorize("district"), receiveDev);
router.route("/sendDevice").post(authorize("district"), sendDeviceToSector);
router
  .route("/report/working")
  .get(authorize("district", "reb", "rtb"), getWorkingPcInDistrict);
router
  .route("/report/damaged")
  .get(authorize("district", "reb", "rtb"), getDamagedPcInDistrict);
router
  .route("/report/repaired")
  .get(authorize("district", "reb", "rtb"), getRepairedPcInDistrict);
router
  .route("/report/stolen")
  .get(authorize("district", "reb", "rtb"), getStolenPcInDistrict);
router
  .route("/report/archieved")
  .get(authorize("district", "reb", "rtb"), getArchievedPcInDistrict);

module.exports = router;
