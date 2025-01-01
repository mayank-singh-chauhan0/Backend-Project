//verify krega ki user h ya nhi
// verify krange accestoken and refreshtoken dono se user ko to agr aap true login user ho to req k ander ak object add krdenge 

// aagr mobile se req aari h tto us case m refreshtoken us case m Authorization: Bearer token jaisa kuch use krte h hm usme bhut bada h aata h punra nhi chiea hota sirf access token chie hota h 

// import {asyncHandler} from "../utils/asyncHandler.js";
// import jwt from "jsonwebtoken";
// import { User } from "../models/user.model.js";
// export const verifyJWT = asyncHandler(async(req , res , next)=>{
  
//     try {
//         const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "")
    
//         if(!token){
//             return res.status(401).json({success:false , message:"Not Authorized"})
//         }  
    
//         // ab verify krenge token ko decode krenge 
//         const decodes = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET )
        
//         const user = await User.findById(decodes._id);
//         if(!user){
//             return res.status(401).json({success:false , message:"Not Authorized"})
//         }
//         req.user = user;
//         next();
//     } catch (error) {
//         throw new Error( 404 , "Not Authorized")
//     }
// })

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})
 