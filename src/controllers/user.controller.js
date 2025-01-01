import {asyncHandler}   from "../utils/asyncHandler.js"
 import {ApiError}  from "../utils/ApiError.js"
import{User}  from "../models/user.model.js"
import {uploadOnCloudinary}  from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessAndRefreshToken = async(userId)=>{
  try {
    // refresh token is used to because bar bar pass nhi puchna pade
    // at = user ko detet h
    
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false})
    //save krte time mongo ke model click hojate h like pass hona chiea usse bachene k lieye validateBeforeSave false krte h
    return {accessToken , refreshToken};
  } catch (error) {
    throw new ApiError(500 , "token not generated" , error);
  }
}

const registerUser = asyncHandler(async (req, res) => {
    const {fullName , email , username , password} = req.body;
    console.log(email , " dcdscs");
    if(
                !fullName ||
                !email ||
                !username ||
                !password
            ){
                throw ApiError(404 , "please enter details") 
            }
          const existedUser =  await User.findOne({
                // used to check multiple fild present or not
                $or : [{username} , {email}]
            })
            if(existedUser) {
                throw ApiError( 409 , " username Or email already present");
            }

// multer give req.file accesss , first propery k ander ak object milta h  .path likste h and vo file ka path mil jaega local path isliye ki abi server pr h cloudinary pe upload  nhi hua h
  const avatarPath =  req.files?.avatar[0]?.path;
  // const coverImagePath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
  if(!avatarPath) throw new ApiError(404 , "bhai avatar to chiea upload kr");


  // ab cloudinary ki bate hongi cloudinry ka fun to bna hi rka  h bs usme localpath kka access dena h use aur upload m time to lgta hi h is liye hme asynchandler k bad bhi async use kiya tha isi liye taki ab await use kr skaee
  const avatar = await uploadOnCloudinary(avatarPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if(!avatar) throw new ApiError(404 , "bhai avatar to chiea upload kr");



  // ab data base ki bari  
  // User se hi bat krrha data base se .create method h aur ye object lega
 const user = await User.create(
    {
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase(),

    }
  )
  // check if user is created or not
  const createUser = await User.findById(user._id).select(
    //syntex h yad hi krna pdega isme likte h ki kya kya nhi chiea "-" mtlab nhi chiea
    "-password -refreshToken"
  )
  if(!createUser) throw new ApiError(404 , "not registerd properly");

  // ab respose bej do aur optimized trike se bejenge usi k liye api response bnaya tha hmne res.status postman k liye lgaya h easily read hojae vo yhi read krta h usko nhi pta apiresponse kya h bina iske bhi sirf apiresponse se kam chal skta h
  return res.status(200).json(new ApiResponse(201 , "user created successfully" , createUser));
 
  
})

const loginUser = asyncHandler(async (req, res) => {




  const{email , password , username} = req.body;

  if(!(email && username)) throw new ApiError(404 , "please enter email and usereweeeeewname");
  // find user by email or username
  const user = await User.findOne({
    $or : [{email} , {username}]
  })
  if(!user) throw new ApiError(404 , "user not found");
  //User se ham mongodb k method ko access krte h aur user se hmne jo define kiya h vo use krte h
 const passCorr = await user.isPasswrdCorrtect(password);

 if(!passCorr) throw new ApiError(404 , "password not correct");

  
 // ab token bnana h jwt se
 //seperate function bna lete h tokens k liye 
 const{accessToken , refreshToken}=   await generateAccessAndRefreshToken(user._id);
 //ab cookie m bejo inko mtlab kon kon si information bejni h like pass nhi bejna
 // user k ander jo refresh token h vo empty h  dala thodi h kuch abhi tk to ussko chale update krdo ya data base se querry mar do
 
 // ye lne optional h
 const loggedInUser =await User.findById(user._id).select("-password -refreshToken");

  // options isliye use krte h ki aare inke  bina aage bad gye to koi bhi frontend se modify kr skta h cookie ko 
 const  options ={
  httpOnly:true,
  secure : true
 }
  
 return res.status(200).
 cookie("refreshToken" , refreshToken , options).
 cookie("accessToken" , accessToken , options).
 json(new ApiResponse(200 , "login successfully" , {
  loggedInUser,
  accessToken,
  refreshToken
}));

})

// middleware se user ki detail mil jaegi bcz aase hi logout krne k liye crucial detaisl thodi dedenge vrna vo kisi ko bhi logout krdega


//cookie parser middleware h usse hmnse cookie.res ka acess miljata h smae cookie.req kabhi miljaega
// to iskke bad hm pna ak middleware bhi design krskte h
//ab auth ka middleware likengw




// ab aacess and refresh token ki bat krletr h isme kya h ki jo access token ka time km hota h to ham what we do we make a endpoint so whenever our accesstoken get expire we hit that endpoint and it give request to the mongodb and ask for new access token by verify itself with respect to refresh tokenm
  //endpoint rout m kenge menthod yha

  const refreshAccessToken = asyncHandler(async(req, res) => {
    //koi mobile app use krrha ho uske liye req.body use krete h
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken) throw new ApiError(404 , "refresh token not found");
    // JsonWebTokenError
    //ab refresh token verify krna h
    //direct user vala nhi use krnenge vo encoded hota h phele uske decoded krna padega

   try {
    const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
    )
    // refresh token se user id mil jaega yad kro vhi dalaa tha refreshtoken bnte time usme id se mongo m querry marro aur details lelloo
     const user =  await User.findById(decodedToken?._id);
     if(!user) throw new ApiError(404 , "invalid refreshtoken");
 // match krte h token ko
 
    if(incomingRefreshToken !== user.refreshToken) throw new ApiError(404 , "invalid refreshtoken");
     
     //ab naya access token bnana h aur cookie  m bej rhe ho to options to rkne padenge
     const options = {
       httpOnly : true,
       secure : true
     }
     const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id);
     return res.status(200).
     cookie("accessToken" ,  accessToken , options).
     cookie("refreshToken" , newRefreshToken , options).
     json(new ApiResponse(200 , "new access token generated" , {accessToken : accessToken ,refreshToken: newRefreshToken}))
   } catch (error) {
     throw new ApiError(404 , "invalid refreshtoken");
    
   }

})


 
const logoutUser = asyncHandler(async(req, res) => {
  //user ka acess h middleware bnaya na abhi to ab kuch nhi krna bas user ka refresh token ko empty ktna h  
  await User.findByIdAndUpdate(
      req.user._id,
      // {
      //     $unset: {
      //         refreshToken: 1 // this removes the field from document
      //     }
      // },
      {
        $set: {
          refreshToken: undefined
        }

      },
      {
          new: true
      }
  )

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
})

const changePass = asyncHandler(async(req , res) =>{
  const {oldPass , newPass} = req.body
// pass chane krrparha h mtlab user login h aur uske pass req.user ka access h 
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPass)
  if(!isPasswordCorrect) throw new ApiError(400 , "Invalid old PAss")

    user.password = newPass
    await user.save({validateBeforeSave : false})
    return res.status(200).json(
      new ApiResponse(200 , "password changed successfully"))
})


const getCurrentUser = asyncHandler(async(req , res) =>{

  return res.status(200).json(
    new ApiResponse(200 , "current user details" , req.user)
  ) 
})

const updateAccountDetails = asyncHandler(async(req , res)=>{
  const{fullName , email} = req.body;
  if(!fullName || !email) throw new ApiError(404 , "please enter details");
//   const user = await User.findById(req.user?._id);
// if(!user) throw new ApiError(404 , "user not found");
// user.fullName = fullName;
// user.email = email;
// await user.save({validateBeforeSave : false})
 
const user = await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
      fullName : fullName,
      email : email
    }
  },
  // new true se vo updated value return bhi krdeta h aur user me se pass remove krna h
   {new : true}
).select("-password")

return res
.status(200)
.json(new ApiResponse(200 , "acc details updated " , user));
})

const updateUserAvatar = asyncHandler(async(req , res)=>{
  // is bar req.files..avatar[0] nhi kiya bcz jarurat nhi h pehele ham multiple files ki bat krrhe the isliye files liya aur use bad jo array aaya uska first element select kiya
  const avatarPath = req.file?.path;
  if(!avatarPath) throw new ApiError(404 , "Avatar files is missing");
  const avatar = await uploadOnCloudinary(avatarPath);
  if(!avatar.url) throw new ApiError(404 , "avatar not uploaded");
  
 const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar : avatar.url
      }
    },
    {new : true}
  ).select("-password") ;
  return res.status(200)
  .json(
     new ApiResponse(200 , "Avatar image updated successfully" , user)
  )
})


const updateUserCoverImage = asyncHandler(async(req , res)=>{
  // is bar req.files..avatar[0] nhi kiya bcz jarurat nhi h pehele ham multiple files ki bat krrhe the isliye files liya aur use bad jo array aaya uska first element select kiya
  const coverImagePath = req.file?.path;
  if(!coverImagePath) throw new ApiError(404 , "CI files is missing");
  const coverImage = await uploadOnCloudinary(coverImagePath);
  if(!coverImage.url) throw new ApiError(404 , "avatar not uploaded");
  
 const user= await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage : coverImage.url
      }
    },
    {new : true}
  ).select("-password") ;
  return res.status(200)
  .json(
     new ApiResponse(200 , "cover image updated successfully" , user)
  )
})
                   

const getUserChannelProfile = asyncHandler(async(req , res)=>{
const {username } = req.params;

if(!username?.trim()) throw new ApiError(404 , "username missing");
//yhi syntex hota h aggrigation pipeline ka rat loo
// model ka nam bhi small m hojaega aur plurel bn jaega
// channel ko select krenge to subscribers milenge and voice versa
 const channel = await User.aggregate([
  {
    $match:{
      username : username?.toLowerCase()
    }   
  },
  { /// total number of subscriber
     $lookup:{
      from :"subscriptions",
      localField : "_id",
      foreignField : "channel",
      // as bas nam h apni jo nhi field bni h uska
      as : "subscribers"
    } 
  },
  {
    //total number of channel subscribed 
    $lookup:{
      from : "subscriptions",
      localField : "_id",
      foreignField : "subscriber",
       as : "subscribedTo"
    }   
  },{
    // ab uper sari fields ak jga aato gai h ab unko add krna h 
    $addFields:{
      subscribersCount : {
        $size : "$subscribers"
      },
      channelsSubscribedToCount : {
        $size : "$subscribedTo"
      },

      //ab dek rhe h kya jo page open h vo subscriber h ya nhi 
      isSubscribed:{
         $cond:{
          if:{$in : [req.user?._id , "$subscribers.subscriber"]},
          then : true,
          else : false,
         }
      }
    }
  },
  {
    //project :- sari ak dam se project nhi krna selected field hi deni h
   $project:{
       fullName : 1 ,
       username : 1,
       subscribersCount : 1,
       channelsSubscribedToCount : 1,
       isSubscribed : 1,
       avatar : 1,
       coverImage : 1,
       email : 1

   }
  }
 ])
// console krva lio ak bar channel koo

if(!channel?.length) throw new ApiError(404 , "channel not found");

return res.status(200).json(new ApiResponse(200 , "channel profile" , channel[0]));
})

const getWatchHistory = asyncHandler(async(req , res) =>{
  const user = await User.aggregate([
    {
      $match : {
        // yha pe aap direcy id nhi de skte actually jo id aap dete ho usko modify krke actual id bnata h mongooge phir data base mme bejta h aggrigationdirect mongo db se bat krte h to hme vo actual id bnani padti h

        _id : new mongoose.Types.ObjectId(req.user._id)

      }
    },
    {
      $lookup :{
        from :"videos",
        localField :"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        // ab bhot sare document vo videos aagye h ab is point pe h ham pr problem kya h ki ak subpipeline lgani padegi vrna kuch nhi milega aapkooo
        pipeline:[
          {
            // ab ham h vidoes m aur ab lookup ki pipeline lga rhe ho lookup krna h users m kyoki dalna to ultimately owner k field m hi h na watch history
            $lookup:{
                  from : "users",
                  localField:"owner",
                  foreignField: "_id",
                  as:"owner",
                  //ab kya h pura user aagya pr hme pura hodi chiea
                  pipeline:[
                  {  $project:{
                        fullName: 1 ,
                        username:1 ,
                        avatar :1 
                    }
                  },
                  //ye bs frontend ki shuliyat k liye h ki usko vo usko phele owner ki array milti usme se zeroth element nikalna padta use bachne k liye
                  // owner field h usko hi overwrite krdete h
                  {
                    $addFields:{
                       owner :{
                        $first:"owner"

                       }
                    }
                  }
                  ]
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
      200 , "user watchHistory" , user[0].watchHistory
    )
  )
  
})
           
export { registerUser ,
   loginUser ,
    logoutUser , 
    refreshAccessToken , 
    changePass , 
    getCurrentUser , 
    updateAccountDetails , 
    updateUserAvatar , 
    updateUserCoverImage,
    getWatchHistory,
    getUserChannelProfile
  
  };
