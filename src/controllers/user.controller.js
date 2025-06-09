import { asycHandler } from "../utils/asycHandler.js";
import ApiError from "../utils/ApiError.js"
import User from "../models/user.model.js"
// get user from frontend 
    // validation - not empty 
    // check for user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response
    // **********************************
// if(fullName===""){
    //     throw new ApiError(400, "full Name is required")
    // }
    // else if(email===""){
    //     throw new ApiError(400,"Email is required")
    // }

    // Check wheather every feild is filled

const registerUser = asycHandler(async (req,res)=>{
    

    const{fullName, email, username, password} = req.body
    console.log("email: ", email)
        console.log(" Incoming user data:", { fullName, email, username, password });

    
    if([fullName,email,username,password].some((feild)=> feild?.trim==="")){
        console.log("One or more fields are empty");
        throw new ApiError(400, "All feilds required")
    }

    // check wheather user already exists
    const existedUser= await  User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        console.log("User already exists");
        throw new ApiError(409, "UserName or email already exists")
    }

    req.files?.avatar[0]?.path

    
})

export {registerUser}