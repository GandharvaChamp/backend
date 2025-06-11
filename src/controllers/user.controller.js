import  asycHandler  from "../utils/asycHandler.js";
import ApiError from "../utils/ApiError.js"
import User from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
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
    
    console.log("req.files =", req.files);
    console.log("req.body =", req.body);

    const{fullName, email, username, password} = req.body
    console.log("email: ", email)
        console.log(" Incoming user data:", { fullName, email, username, password });

    // Check wheather every feild is filled
    if([fullName,email,username,password].some((feild)=> feild?.trim()==="")){
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

    const avatarLocalPath= req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log("Received files:", req.files);

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
   }
   
    // I will get cloudinary url here
    const avatar = await uploadOnCloudinary(avatarLocalPath) 
    const coverImage=  await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        console.log("Received files:", req.files);
        throw new ApiError(400,"Avatar file is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser  = await User.findById(user._id).select(
        "-password -refreshToken"  // things not to include
    )
    
    if(!createdUser){
        throw new ApiError(500 , "something went wrong while registering the User")
    }

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User register sucessfully")
    )
    
})

export default registerUser