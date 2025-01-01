import { Router } from "express";
import { loginUser, logoutUser, registerUser , refreshAccessToken ,changePass , getCurrentUser , updateAccountDetails ,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
// const router = Router();



// router.route("/register").post(  
//     upload.fields([
//         {
//             name:"avatar",
//             maxCount:1
//         },
//         {
//             name:"coverImage",
//             maxCount:1
//         }
//     ]
//     )
//     ,registerUser);

//     router.route("/login").post(loginUser)

// //secured rottes middleware work :- logout se phele verifyJwt method run hona chiea ab logout method m req.user ka access hoga
// router.route("/logout").post(verifyJWT ,logoutUser)

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changePass)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)


// avtar k case m middleware chiea aur single file chiea
// patch use krengr bcz nhi krenge to pura update hojaega hme ak portion chiea
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
//prams k liye ":" use krna pdega
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router; 