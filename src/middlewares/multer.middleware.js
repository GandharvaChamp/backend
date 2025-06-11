import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })
export default upload

// import multer from "multer";

// // Set allowed file types
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png/;
//   const mimeType = allowedTypes.test(file.mimetype);
//   const extName = allowedTypes.test(file.originalname.toLowerCase());

//   if (mimeType && extName) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only .png, .jpg and .jpeg files are allowed!"));
//   }
// };

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public/temp");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 1 * 1024 * 1024 // 1 MB
//   }
// });

// export default upload;
