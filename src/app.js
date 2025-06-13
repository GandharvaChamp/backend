import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import multer from "multer"
const app = express()

app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials :true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

// User router imports
import userRouter from "./routes/user.routes.js"
app.use("/api/v1/users", userRouter)


// At the end of your express app setup
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    return res.status(400).json({ error: err.message });
  } else if (err) {
    // Other errors
    return res.status(500).json({ error: err.message });
  }
  next();
});






export {app}