import mongoose, {isValidObjectId, Mongoose} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription  = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }   
     const isSubs = await Subscription.findOne({
        subscriber : req.user?._id,
        channel : channelId
     })

     if(isSubs){
        await Subscription.findByIdAndDelete(isSubs?._id);
        return res
        .status(200)
        .json( new ApiResponse(200 , "unsub successfully" , {subscribed: false}))
     }

     await Subscription.create(
        {
            subscriber : req.user?._id,
            channel : channelId
        }
     )
     return res
     .status(200)
     .json(
         new ApiResponse(
             200,
             "subscribed successfully",
             { subscribed: true },
         )
     );

})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    let { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    channelId = new mongoose.Types.ObjectId(channelId);

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline :[
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber",
                        }
                    },
                    {
                        $addFields:{
                            subscribedToSubscriber :{
                                $cond:{
                                    if:{
                                        $in : [channelId , "$subscribedToSubscriber.subscriber"

                                        ] },
                                        then : true,
                                        else : false
                                },
                               
                            },
                            subscribersCount: {
                                $size: "$subscribedToSubscriber",
                            },
                        }
                    }
                ]
            }
        }
        ,
        {
            $unwind: "$subscriber",
        },
        
        {
            $project: {
                _id: 0,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    subscribedToSubscriber: 1,
                    subscribersCount: 1,
                },
            },
        },



    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "subscribers fetched successfully" ,
            subscribers,
        )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription ,
    getUserChannelSubscribers,
    getSubscribedChannels,
}