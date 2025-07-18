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

   const generateAccessAndRefeshtoken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access tokens and refresh tokens")
    }
   }  

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
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log("Received files:", req.files);

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath= req.files.coverImage[0];
    }


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

  const loginUser = asycHandler(async (req,res)=>{
    const {email,username,password}= req.body

    if(!(username || email)){
        throw new ApiError(400,"Username or email is requied")
    }

    // this user holds entire collection of that user
    const user  = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Your passward is incorrect")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefeshtoken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    console.log(loggedInUser)

    const options= {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user:loggedInUser,accessToken,refreshToken
            }, "User logged In sucessfully"
        )
    )
  })

  const logoutUser=  asycHandler(async (req, res)=>{
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    refreshToken: undefined
                }
            },{
                new : true
            }
        )

        const options= {
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},"User logged Out"))

  })

  const refreshAccessToken = asycHandler (async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorised request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )

        
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
  })

  const ChangeCurrentPassword  = asycHandler(async(req,res)=>{
    const {oldPassword,newPassword}= req.body

    const user = await User.findById((req.user?._id))
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))

  })

  const getCurrentUser = asycHandler(async (req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"Current user fetched successfully")
  })
  
  const updateAccountDetails = asycHandler(async (req,res)=>{
    const {fullName,email}= req.body

    if(!(fullName || email)){
        throw new (400, "All feilds are required")
    }

    const user = User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullName,
            email:email
        }
    }, {
        new: true
    }).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated sucessfully"))
  })

  const updateUserAvatar = asycHandler(async(req,res)=>{

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing ")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },{new:true}
    ).select("-password")
    
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar Image uploaded successfully"))
  })

  const updateUserCoverImage = asycHandler(async(req,res)=>{

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Avatar file is missing ")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },{new:true}
    ).select("-password")
    
    return res
    .status(200)
    .json(new ApiResponse(200,user,"cover Image uploaded successfully"))
  })

  const getUserChannelProfile = asycHandler(async(req, res) => {
  const {username} = req.params

  if (!username?.trim()) {
      throw new ApiError(400, "username is missing")
  }

  const channel = await User.aggregate([
      {
          $match: {
              username: username?.toLowerCase()
          }
      },
      {
          $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers"
          }
      },
      {
          $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "subscriber",
              as: "subscribedTo"
          }
      },
      {
          $addFields: {
              subscribersCount: {
                  $size: "$subscribers"
              },
              channelsSubscribedToCount: {
                  $size: "$subscribedTo"
              },
              isSubscribed: {
                  $cond: {
                      if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                      then: true,
                      else: false
                  }
              }
          }
      },
      {
          $project: {
              fullName: 1,
              username: 1,
              subscribersCount: 1,
              channelsSubscribedToCount: 1,
              isSubscribed: 1,
              avatar: 1,
              coverImage: 1,
              email: 1

          }
      }
  ])

  if (!channel?.length) {
      throw new ApiError(404, "channel does not exists")
  }

  return res
  .status(200)
  .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
  )
})

const getWatchHistory = asycHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})



export { registerUser, loginUser,logoutUser,
     refreshAccessToken, ChangeCurrentPassword,getCurrentUser,
    updateAccountDetails,updateUserAvatar, updateUserCoverImage,getUserChannelProfile,getWatchHistory }