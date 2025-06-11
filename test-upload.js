// import express from "express";
// import multer from "multer";

// const app = express();

// const storage = multer.diskStorage({
//   destination: "./public/temp",
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
// });

// const upload = multer({ storage });

// app.post("/upload", upload.fields([
//   { name: "avatar", maxCount: 1 },
//   { name: "coverImage", maxCount: 1 }
// ]), (req, res) => {
//   console.log("Files:", req.files);
//   console.log("Body:", req.body);
//   res.status(200).json({ success: true });
// });

// app.listen(3001, () => console.log("Server running on http://localhost:3001"));
