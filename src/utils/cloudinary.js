// // import { v2 as cloudinary } from 'cloudinary'
// // import fs from 'fs'

// // cloudinary.config({ 
// //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
// //   api_key: process.env.CLOUDINARY_API_KEY, 
// //   api_secret: process.env.CLOUDINARY_API_SECRET
// // });

// // const uploadOnCloudinary= async (localFilePath)=>{
// //     try {
// //         if(!localFilePath) {
// //             console.log("File not found")
// //             return null
// //         }
// //         // upload the file on cloudinary
// //         const response = await cloudinary.uploader.upload(localFilePath,{
// //             resource_type:"auto"
// //         })
// //         // File has been uploaded sucessfully
// //         console.log("file has been uploaded Successfully ",response.url)
// //         return response;

// //     } catch (error) {
// //         fs.unlinkSync(localFilePath)
// //         return null;
// //     }

// // }

// export default uploadOnCloudinary
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("File not found");
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File uploaded to Cloudinary:", response.url);

    // Delete local file after upload
    fs.unlinkSync(localFilePath);
    return response;

  } catch (error) {
    console.error("Cloudinary upload error:", error.message);

    // Try deleting the file if it exists
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (unlinkError) {
      console.error("❌ Error deleting local file:", unlinkError.message);
    }

    return null;
  }
};

export default uploadOnCloudinary;
