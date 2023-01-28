const express = require("express");
const {
  userRegister,
  login,
  logout,
  updateDetails,
  updatePassword,
  resetPassword,
  fetchUsers,
  deleteUser,
  getSingleUser,
  changeStatus,
  deactivateStatus,
  activateStatus,
} = require("../controllers/auth");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// user registration
router.post("/register", protect, userRegister);
router.get("/users", protect, fetchUsers);

// user login
router.post("/login", login);
router.get("/logout", logout);
// // router.get("/me", protect, getMe);
router.put("/updatedetails", protect, updateDetails); //**update user details */
router.put("/updatepassword", protect, updatePassword); //**update user passwrod */
router.put("/resetpassword/:resettoken", resetPassword); //**reset password */
router.delete("/users/:id", protect, authorize("rtb", "reb"), deleteUser);
router.get("/users/:id", protect, getSingleUser);
router.put(
  "/deactivate/status/:id",
  protect,
  authorize("rtb", "reb"),
  deactivateStatus
);
router.put(
  "/activate/status/:id",
  protect,
  authorize("rtb", "reb"),
  activateStatus
);

// router.post("/forgotpassword", forgotPassword);

module.exports = router;
