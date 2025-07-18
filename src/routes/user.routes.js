import { Router } from "express";
import { registerUser, loginUser, logoutUser, ChangeCurrentPassword, getCurrentUser, updateAccountDetails,updateUserAvatar, updateUserCoverImage, getWatchHistory}  from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js"
import  verifyJWT  from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
const router = Router()

router.route("/register").post(upload.fields([
    {
     name :"avatar",
     maxCount: 1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser)

router.route("/login" ).post(loginUser)

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,ChangeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/cover-Image").patch(verifyJWT,upload.single("/coverImage"), updateUserCoverImage)

router.route("/history").get(verifyJWT, getWatchHistory)


export default router
