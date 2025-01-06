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
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails",
                pipeline: [
                    {
                        $project: {
                            likedBy: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likeDetails",
                },
                ownerDetails: {
                    $first: "$ownerDetails",
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likeDetails.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            },
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                ownerDetails: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
  const {content} = req.body;
  const {tweetId} = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
}
// console.log(tweetId  , "cew"); 
  if(content.toString().trim() === "") throw new ApiError (400 , "Contnet is Required");
//   console.log(tweetId  , "fr4e"); 
  const user = await Tweet.findById(tweetId);
   
   if(!isValidObjectId(user?._id)) throw new ApiError (400 , "User is not valid");

   if (!user) {
    throw new ApiError(404, "Tweet not found");
}
   if(req.user?._id.toString()!==user.owner.toString()) throw new ApiError (400 , " not valid user");
   
   const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId ,
    {
        $set : {
          content
        }
    },
    { new: true }
   )
//    console.log( user.owner ,"wede" ,req.user , "failed" );
   if (!updatedTweet) {
    throw new ApiError(500, "Failed to edit tweet please try again");
}
// console.log( updateTweet.content , "dwq" );
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
  
      await Tweet.findByIdAndDelete(
      tweetId 
     )
    
  
  return res
      .status(200)
      .json(new ApiResponse(200, "Tweet deleted successfully" , {tweetId}));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}