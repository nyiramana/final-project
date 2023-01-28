const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../helpers/errorResponse");
const User = require("../models/User");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (
    req.cookies.token ||
    req.body.token ||
    req.header["token"] ||
    req.query.token
  ) {
    token =
      req.cookies.token ||
      req.body.token ||
      req.header["token"] ||
      req.query.token;
  }
  //   make sure is exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route!", 401));
  }
  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized to access this route!", 401));
  }
});
// grant access to specific user
exports.authorize = (...roles) => {
  // will return middleware fx
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is Unauthorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
