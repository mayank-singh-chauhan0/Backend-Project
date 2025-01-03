import mongoose, { connect, isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
  const {content} = req.body;
  const user = req.user;
  if(content.toString().trim() === "") throw new ApiError (400 , "Content is Required");
  if(!isValidObjectId(user?._id)) throw new ApiError (400 , "User is not valid");
   const tweet = await Tweet.create(
   { content ,
       owner : user?._id
}
   )
   if (!tweet) {
    throw new ApiError(500, "failed to create tweet please try again");
}

return res
    .status(200)
    .json(new ApiResponse(200, "Tweet created successfully" , tweet));

})

const getUserTweets = asyncHandler(async (req, res) => {
     
})

const updateTweet = asyncHandler(async (req, res) => {
  const {content} = req.body;
  const {tweetId} = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
}
  if(content.toString().trim() === "") throw new ApiError (400 , "Contnet is Required");
  if(!isValidObjectId(user?._id)) throw new ApiError (400 , "User is not valid");
   const user = await Tweet.findById(tweetId);
   if (!user) {
    throw new ApiError(404, "Tweet not found");
}
   if(req.user?._id.toString()!==user.owner.toString()) throw new ApiError (400 , " not valid user");

   const updatedTweet = Tweet.findByIdAndUpdate(
    tweetId ,
    {
        $set : {
          content
        }
    },
    { new: true }
   )
   if (!updatedTweet) {
    throw new ApiError(500, "Failed to edit tweet please try again");
}

return res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully" , updatedTweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
    // const {content} = req.body;
    const {tweetId} = req.params;
  
   
    if(!isValidObjectId(tweetId)) throw new ApiError (400 , "User is not valid");
     const user = await Tweet.findById(tweetId);
     if (!user) {
      throw new ApiError(404, "Tweet not found");
  }
     if(req.user?._id.toString()!==user.owner.toString()) throw new ApiError (400 , " not valid user");
  
     const deletedTweet = Tweet.findByIdAndDelete(
      tweetId 
     )
    
  
  return res
      .status(200)
      .json(new ApiResponse(200, "Tweet updated successfully" , {tweetId}));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}