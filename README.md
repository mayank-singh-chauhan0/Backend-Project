# StreamSphere

## Introduction
StreamSphere is a powerful and feature-rich video streaming platform backend built with modern technologies. It provides a comprehensive solution for creating a social video sharing experience, combining the best aspects of popular streaming platforms with unique social features.

This backend system supports everything from video management and user authentication to social interactions and real-time engagement. With features like video uploading, processing, and streaming, combined with social elements such as tweets, comments, and likes, StreamSphere creates an engaging community-driven platform.

### Key Features Highlights
- Robust video processing and streaming capabilities
- Advanced user authentication and authorization
- Social interaction system (likes, comments, tweets)
- Cloud-based media storage with Cloudinary
- Scalable architecture using Express.js and MongoDB

## Tech Stack
- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Media Storage**: Cloudinary
- **File Handling**: Multer
- **Password Security**: bcrypt
- **API Documentation**: Swagger
- **Development**: Nodemon
- **Environment Variables**: dotenv

## Features

### User Management
- User registration with email verification
- Secure login with JWT authentication
- Password reset functionality
- Profile management (update details, avatar upload)
- User channel page with subscriber count
- User subscribing/unsubscribing functionality
- Watch history tracking

### Video Features
- Video upload with thumbnail selection
- Video processing with Cloudinary
- Video search and filtering
- Pagination for video listings
- Video visibility control (public/private)
- Video metrics (views, likes, comments)
- Video playback with streaming support

### Social Features
- Like/dislike videos
- Comment on videos
- Reply to comments
- User subscriptions
- Watch history

### Tweet System
- Create and publish tweets
- Like/unlike tweets
- Update and delete tweets
- User timeline for tweets
- Tweet content management

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/logout` - Logout user
- `POST /api/v1/users/refresh-token` - Refresh access token

### User Operations
- `GET /api/v1/users/current-user` - Get current user details
- `PATCH /api/v1/users/update-account` - Update user details
- `PATCH /api/v1/users/update-avatar` - Update user avatar
- `PATCH /api/v1/users/update-cover-image` - Update cover image
- `PATCH /api/v1/users/change-password` - Change password
- `GET /api/v1/users/channel/:username` - Get user channel

### Subscription
- `POST /api/v1/subscriptions/toggle-subscription` - Subscribe/unsubscribe to a channel
- `GET /api/v1/subscriptions/user-subscribers` - Get user subscribers
- `GET /api/v1/subscriptions/subscribed-channels` - Get subscribed channels

### Videos
- `POST /api/v1/videos` - Upload a video
- `GET /api/v1/videos` - Get all videos
- `GET /api/v1/videos/:videoId` - Get video by ID
- `PATCH /api/v1/videos/:videoId` - Update video details
- `DELETE /api/v1/videos/:videoId` - Delete a video
- `PATCH /api/v1/videos/toggle-publish/:videoId` - Toggle video visibility
- `GET /api/v1/videos/get-videos-by-user` - Get user videos

### Likes
- `POST /api/v1/likes/toggle-video-like` - Like/unlike a video
- `POST /api/v1/likes/toggle-comment-like` - Like/unlike a comment
- `POST /api/v1/likes/toggle-tweet-like` - Like/unlike a tweet
- `GET /api/v1/likes/video/:videoId` - Get video likes

### Comments
- `POST /api/v1/comments/:videoId` - Add a comment
- `GET /api/v1/comments/:videoId` - Get video comments
- `PATCH /api/v1/comments/:commentId` - Update a comment
- `DELETE /api/v1/comments/:commentId` - Delete a comment

### Tweets
- `POST /api/v1/tweets` - Create a tweet
- `GET /api/v1/tweets/user/:userId` - Get user tweets
- `PATCH /api/v1/tweets/:tweetId` - Update a tweet
- `DELETE /api/v1/tweets/:tweetId` - Delete a tweet

### Watch History
- `POST /api/v1/history/add` - Add to watch history
- `GET /api/v1/history/get` - Get watch history
- `DELETE /api/v1/history/clear` - Clear watch history

## Project Structure
```
src/
├── controllers/         # Request handlers
├── models/              # Database models
├── routes/              # API routes
├── middlewares/         # Custom middlewares
├── utils/               # Utility functions
│   ├── cloudinary.js    # Cloudinary configuration
│   └── ...
├── configs/             # Configuration files
├── constants/           # Constant values and enums
└── app.js               # Express app setup
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- Git

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Installation Steps
1. Clone the repository
   ```
   git clone https://github.com/mayank-singh-chauhan0/StreamSphere.git
   ```

2. Navigate to the project directory
   ```
   cd StreamSphere
   ```

3. Install dependencies
   ```
   npm install
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. For production
   ```
   npm start
   ```

## API Documentation
API documentation is available at `/api-docs` when running the server locally.

## License
This project is licensed under the MIT License.

## Acknowledgments
- Express.js and MongoDB for the robust backend infrastructure
- Cloudinary for media storage solutions
- All open-source contributors whose libraries made this project possible

