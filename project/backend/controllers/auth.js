const crypto = require("crypto");
const ErrorResponse = require("../helpers/errorResponse");
const asyncHandler = require("../middleware/async");

const MinUser = require("../models/User");
const checkDestination = require("../helpers/checkDestination");

// register
exports.userRegister = asyncHandler(async (req, res, next) => {
  const { firstname, lastname, email, destination, phone, password, role } =
    req.body;
  const checkIns = checkDestination(req);

  const createdIns = checkIns.institution;
  // create user
  const user = await MinUser.create({
    firstname,
    lastname,
    email,
    destination,
    phone,
    password,
    role,
    createdIns,
  });
  // create TOKEN
  res.status(200).json({ msg: `User ${firstname} is created `, data: user });
});

exports.fetchUsers = asyncHandler(async (req, res) => {
  const destination = checkDestination(req);
  const userInstitution = destination.institution;

  const users = await MinUser.find({
    createdIns: userInstitution,
  });

  const filterdUser = users.filter((u) => u._id !== req.user._id);
  console.log(typeof users._id);
  res.status(200).json({ msg: "success", users: filterdUser });
});
exports.deleteUser = asyncHandler(async (req, res, next) => {
  user = await MinUser.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(
      new ErrorResponse(`user with id: ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({
    success: true,
    msg: "user with id: " + req.params.id + " Has deleted",
  });
});

exports.getSingleUser = asyncHandler(async (req, res, next) => {
  const user = await MinUser.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorResponse(`user with id: ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({ msg: "success", data: user });
});

// login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await MinUser.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }
  if (user.isActive === false) {
    return next(
      new ErrorResponse(
        "Your account has been locked by admin please call Admin for Support",
        401
      )
    );
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// user logout
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    data: {},
    msg: "logged out!!",
  });
});

// Get token from models and create cookies and response
const sendTokenResponse = (user, statusCode, res) => {
  // create token
  const token = user.getSignedJwtToken();
  const userRole = user.role;
  const firstname = user.firstname;
  const lastname = user.lastname;
  const email = user.email;
  const phone = user.phone;
  const destination = user.destination;
  const isActive = user.isActive;

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV == "production") {
    options.secure = true;
  }
  res.status(statusCode).cookie("token", token, options).json({
    message: "success",
    token,
    firstname,
    lastname,
    email,
    phone,
    userRole,
    destination,
    isActive,
  });
};

// updated user details
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
  };

  const user = await MinUser.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: "success",
    data: user,
  });
});

// @desc      Update password
// @route     PUT /api/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await MinUser.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Reset password
// @route     PUT /api/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await MinUser.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

exports.deactivateStatus = asyncHandler(async (req, res, next) => {
  const user = await MinUser.findByIdAndUpdate(
    req.params.id,
    {
      isActive: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res
    .status(200)
    .json({ msg: "user is deactivated to this system", data: user });
});
exports.activateStatus = asyncHandler(async (req, res, next) => {
  const user = await MinUser.findByIdAndUpdate(
    req.params.id,
    {
      isActive: true,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ msg: "User is activated to this system", data: user });
});
