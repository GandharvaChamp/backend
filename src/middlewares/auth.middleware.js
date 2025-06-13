import ApiError from "../utils/ApiError.js";
import asycHandler from "../utils/asycHandler.js";
import jwt from "jsonwebtoken"
import User from "../models/user.model.js";

export const  verifyJWT = asycHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","").trim()
    
        if(!token){
            throw new ApiError(401,"Unathorized request")
        }
    
        const decodedtoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user= await User.findById(decodedtoken?._id).select("-password -refreshToken")
    
        if(!user){

            throw new ApiError(404, "Invalid Access Token")
        }
    
        req.user = user
        next()
    } catch (error) {
         console.error("verifyJWT middleware error:", error.message);
         console.log("Received token:", token);

        throw new ApiError(404,"Invalid access token")
    }

})

export default  verifyJWT