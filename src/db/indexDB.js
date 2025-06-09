
import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
    console.log(`\n Mongo DB connected !! DB HOST: ${connectionInstance.connection.host}`)
    console.log(`port : ${process.env.PORT}`)
  } catch (error) {
    console.log("MONGODB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;

