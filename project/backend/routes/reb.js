const {
  displayAllPc,
  updateReb,
  getSinglePc,
  sendDeviceToDistrict,
  registerDevice,
  deletePc,
  getDamagedPcInReb,
  getArchievedPcInReb,
  getStolenPcInReb,
  getRepairedPcInReb,
  getWorkingPcInReb,
} = require("../controllers/reb");
const { protect, authorize } = require("../middleware/auth");

const router = require("express").Router();

router.use(protect);

router.route("/").get(displayAllPc).post(authorize("reb"), registerDevice);
router
  .route("/:id")
  .put(authorize("reb"), updateReb)
  .get(authorize("reb"), getSinglePc)
  .delete(authorize("reb"), deletePc);

router.route("/sendDevice").post(authorize("reb"), sendDeviceToDistrict);
// reports
router.route("/report/working").get(authorize("reb"), getWorkingPcInReb);
router.route("/report/damaged").get(authorize("reb"), getDamagedPcInReb);
router.route("/report/archieved").get(authorize("reb"), getArchievedPcInReb);
router.route("/report/stolen").get(authorize("reb"), getStolenPcInReb);
router.route("/report/repaired").get(authorize("reb"), getRepairedPcInReb);
module.exports = router;
