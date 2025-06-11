import dotenv from "dotenv";
dotenv.config()
import multer from "multer";
import { app } from "./app.js";
import mongoose from "mongoose";
import { DB_Name } from "./constants.js";
import connectDB from "./db/indexDB.js";
connectDB()
.then()
.catch(err=>console.log("Error ", err.message));

console.log(`${process.env.MONGODB_URI}/${DB_Name}`);
app.listen(process.env.PORT, () => {
console.log(`Server is running at http://localhost:${process.env.PORT}`);
});





