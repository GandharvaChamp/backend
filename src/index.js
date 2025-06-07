import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { DB_Name } from "./constants.js";
import connectDB from "./db/indexDB.js";
connectDB()
.then()
.catch(err)

console.log(`${process.env.MONGODB_URI}/${DB_Name}`);
