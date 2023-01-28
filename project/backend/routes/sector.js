const {
  getDamagedPcInDistrict,
  getRepairedPcInDistrict,
  getArchievedPcInDistrict,
  getStolenPcInDistrict,
} = require("../controllers/district");
const {
  displayAllPc,
  getSinglePCinSector,
  updateSectorPc,
  receiveDevice,
  sendDeviceToSchool,
  getDamagedPcInSector,
  getRepairedPcInSector,
  getStolenPcInSector,
  getArchievedPcInSector,
  getWorkingPcInSector,
} = require("../controllers/sector");
const { protect, authorize } = require("../middleware/auth");

const router = require("express").Router();

router.use(protect);

router
  .route("/")
  .get(authorize("reb", "rtb", "district", "sector"), displayAllPc);
router
  .route("/:id")
  .get(authorize("reb", "rtb", "district", "sector"), getSinglePCinSector)
  .put(authorize("sector"), updateSectorPc);
router.route("/receivedevice/:id").put(authorize("sector"), receiveDevice);
router.route("/sendDevice").post(authorize("sector"), sendDeviceToSchool);
// report
router
  .route("/report/damaged")
  .get(authorize("sector", "district", "reb", "rtb"), getDamagedPcInSector);
router
  .route("/report/repaired")
  .get(authorize("sector", "district", "reb", "rtb"), getRepairedPcInSector);
router
  .route("/report/stolen")
  .get(authorize("sector", "district", "reb", "rtb"), getStolenPcInSector);
router
  .route("/report/archieved")
  .get(authorize("sector", "district", "reb", "rtb"), getArchievedPcInSector);
router
  .route("/report/working")
  .get(authorize("sector", "district", "reb", "rtb"), getWorkingPcInSector);

module.exports = router;
