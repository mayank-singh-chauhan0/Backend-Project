import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const pipeline = [];

    if (query) {
        pipeline.push({
            $search: {
                index: "search-videos",
                text: {
                    query: query,
                    path: ["title", "description"]
                }
            }
        });

    }


    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(404, "invalid user")
        }

        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }

        })
    }

    pipeline.push({ $match: { isPublished: true } })
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push({

        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
            pipeline: [
                {
                    $project: {
                        username: 1,
                        "avatar.url": 1
                    }
                }
            ]

        }

    },
        {
            $unwid: "$ownerDetails"
        })
    const videoAgrigate = await Video.aggregate(pipeline);
    const optios = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const video = await Video.aggregatePaginate(videoAgrigate, optios);
    return res
        .status(200)
        .json(new ApiResponse(200, "Videos fetched successfully", video));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (title.trim() === "") throw new ApiError(400, "title is required");
    if (description.trim() === "") throw new ApiError(400, "description is required");
    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if (!videoFileLocalPath) {
        throw new ApiError(400, "videoFileLocalPath is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnailLocalPath is required");
    }
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    // console.log(videoFile.public_id);
    if (!videoFile) {
        throw new ApiError(400, "Video file not found");
    }

    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail not found");
    }
    const video = await Video.create({
        title,
        description,
        duration: videoFile.duration,
        videoFile: videoFile.url,
           
        
        thumbnail:thumbnail.url,
 
        owner: req.user?._id,
        isPublish: false,
    })
    // console.log(video);
    const videoUploaded = await Video.findById(video._id);

    if (!videoUploaded) {
        throw new ApiError(500, "videoUpload failed please try again !!!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    if (!isValidObjectId(req.user?._id)) {
        throw new ApiError(400, "Invalid userId");
    }
    const video = Video.aggregate(
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "owner",
                as: "owner",

                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscriberCount: {
                                $size: "$subscribers"
                            },
                            isSubscribed: {
                                $cond: {
                                    if: {
                                        $in: [req.user?._id, "$subscribers.subscriptions"]
                                    },
                                    then: true,
                                    else: false

                                }
                            }
                        }

                    },
                    {
                        project: {
                            username: 1,
                            "avatar.url": 1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:
            {
                likeCount: {
                    $size: "likes"
                }
                , owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }

            }

        },
        {
            $project: {
                "videoFile.url": 1,
                title: 1,
                description: 1,
                views: 1,
                createdAt: 1,
                duration: 1,
                comments: 1,
                owner: 1,
                likesCount: 1,
                isLiked: 1
            }
        }

    )
    if (!video) {
        throw new ApiError(400, "Details not fetch properly");

    }
    await Video.findByIdAndUpdate(videoId, {
        $inc: {
            views: 1
        }
    })
    await User.findByIdAndUpdate(
        req.user?._id, {
        $addToSet: {
            watchHistory: videoId
        }
    }

    )
    return res
        .status(200)
        .json(
            new ApiResponse(200, "video details fetched successfully", video[0])
        );


})

const updateVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { videoId } = req.params;
    if (!title) throw new ApiError(400, "title is required");
    if (!description) throw new ApiError(400, "description is required");

    if(!isValidObjectId(videoId))   throw new ApiError(400, "Invalid videoId");
    const video =await Video.findById(videoId);
    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            400,
            "You can't edit this video as you are not the owner"
        );
    }
        const thumbnailToDelete = video.thumbnail.url;
    const thumbnailLocalPath = req.file?.path 
    if(!thumbnailLocalPath)   throw new ApiError(400, "upload failed");
    const thumbnail = uploadOnCloudinary(thumbnailLocalPath);
  
    const updatedVideo = Video.findByIdAndUpdate(
        videoId , {
            $set:{
                title ,
                description ,
                thumbnail: thumbnail.url,

                   
            },
            
        },
        {
            new : true
        }
    )
    
    if (!updatedVideo) {
        throw new ApiError(500, "Failed to update video please try again");
    }

    if (updatedVideo) {
        await deleteOnCloudinary(thumbnailToDelete);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Video updated successfully" , updatedVideo));
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId))   throw new ApiError(400, "Invalid videoId");
    const video =await Video.findById(videoId);
    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            400,
            "You can't delete this video as you are not the owner"
        );
    }
   const videoDelete = Video.findByIdAndDelete(videoId);
   await deleteOnCloudinary(video.thumbnail.url);
//The second parameter "video" specifies the resource type as video because Cloudinary defaults to images if the resource type is not explicitly mentioned.
   await deleteOnCloudinary(video.videoFile.url , "video"); 

   await Like.deleteMany({
    video: videoId
})

 // delete video comments
await Comment.deleteMany({
    video: videoId,
})

return res
    .status(200)
    .json(new ApiResponse(200,"Video deleted successfully" ));
});




const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            400,
            "You can't toogle publish status as you are not the owner"
        );
    }

    const toggledVideoPublish = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video?.isPublished
            }
        },
        { new: true }
    );

    if (!toggledVideoPublish) {
        throw new ApiError(500, "Failed to toogle video publish status");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isPublished: toggledVideoPublish.isPublished },
                "Video publish toggled successfully"
            )
        );
});

    
export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}