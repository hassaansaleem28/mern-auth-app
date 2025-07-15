import mongoose from "mongoose";

async function connectDB() {
  mongoose.connection.on("connected", () => console.log("MongoDB connected!"));
  await mongoose.connect(`${process.env.MONGODB_URL}/mern-auth`);
}
export default connectDB;
