const {
  displayAllPc,
  getSinglePCinSchool,
  updateSchoolPc,
  receiveDevice,
  getTech,
  getSingleTechPc,
  updateTech,
  getWorkingPc,
} = require("../controllers/school");
const {
  getArchievedPc,
  getOneArchieved,
  updateArchieved,
} = require("../controllers/schoolMiscelanous/archievedPc");
const {
  getDamagedPc,
  getOneDamaged,
  updateDamaged,
} = require("../controllers/schoolMiscelanous/damagedPc");
const {
  getRepairedPc,
  getOneRepairedPc,
  updateRepairedPc,
} = require("../controllers/schoolMiscelanous/repairedPc");
const {
  getStolenPc,
  getOneStolenPc,
  updateStolenPc,
} = require("../controllers/schoolMiscelanous/stolenPc");
const { protect, authorize } = require("../middleware/auth");

const router = require("express").Router();
router.use(protect);

router.get("/", displayAllPc);
// classification of pc in school

// display working pc
router.get("/workingPc", getWorkingPc);

router.get("/damagedPc", getDamagedPc);
router.get("/damagedPc/:id", getOneDamaged);
router.put("/damagedPc/:id", updateDamaged);

router.get("/stolenPc", getStolenPc);
router.get("/stolenPc/:id", getOneStolenPc);
router.put("/stolenPc/:id", updateStolenPc);

router.get("/archievedPc", getArchievedPc);
router.get("/archievedPc/:id", getOneArchieved);
router.put("/archievedPc/:id", updateArchieved);

router.get("/repairedPc", getRepairedPc);
router.get("/repairedPc/:id", getOneRepairedPc);
router.put("/repairedPc/:id", updateRepairedPc);

router.get("/technician", getTech);
router.get("/technician/:id", getSingleTechPc);
router.put("/technician/:id", updateTech);

router.route("/:id").get(getSinglePCinSchool).put(updateSchoolPc);
router.put("/recieveDevice/:id", receiveDevice);

module.exports = router;
