const mongoose = require("mongoose");

const DbConnection = async () => {
  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  });
  console.log(`Database connected: ${conn.connection.host}`);
};
module.exports = DbConnection;
