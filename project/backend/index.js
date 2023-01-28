const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

const db = require("./db/database");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error");

const cors = require("cors");
const auth = require("./routes/auth");
const rtb = require("./routes/rtb");
const reb = require("./routes/reb");
const district = require("./routes/district");
const sector = require("./routes/sector");
const school = require("./routes/school");
// load env vars
dotenv.config();

// Connect to db
db();

const app = express();

app.use(cors());
// Body parser
app.use(express.json());

app.use(cookieParser());
// dev logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use("/api/auth", auth); // **** Authentication route */

app.use("/api/rtb", rtb); // ** rtb routes */
app.use("/api/reb", reb); // ** reb routes */
app.use("/api/district", district); //** districts */
app.use("/api/sector", sector); // ** sector routes */
app.use("/api/school", school); // ** school routes */
//404 route
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "The page does not exist on the server.",
    },
  });
});
app.use(errorHandler);

port = process.env.PORT || 2023;
const server = app.listen(
  port,
  console.log(`App is running in ${process.env.NODE_ENV} mode at port ${port}`)
);
// handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // close server & Exit process
  server.close(() => process.exit(1));
});
