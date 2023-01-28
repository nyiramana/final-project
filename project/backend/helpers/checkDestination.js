const checkDestination = (req) => {
  const destination =
    req.cookies.destination ||
    req.body.destination ||
    req.user.destination ||
    req.header["destination"] ||
    req.query.destination;
  const role =
    req.cookies.userRole ||
    req.body.userRole ||
    req.user.role ||
    req.header["userRole"] ||
    req.query.userRole;
  if (role == "reb") {
    return { institution: "reb" };
  }
  if (role == "rtb") {
    return { institution: "rtb" };
  }
  if (role == "district") {
    const result = destination.split("-");
    return { province: result[0], district: result[1] };
  }
  if (role == "sector") {
    const result = destination.split("-");
    return { province: result[0], district: result[1], sector: result[2] };
  }
  if (role == "school") {
    const result = destination.split("-");
    return {
      institution: result[0],
      province: result[1],
      district: result[2],
      sector: result[3],
      school: result[4],
    };
  }
  return {};
};

module.exports = checkDestination;
