// ********imp *** require('dotenv').config({path: './env'});

//top pe isliye h ki as soon as we start our app we want to load our env variables
// uper require niche import ye but common problem h isliye dusra approach use krte h 2nd method h isliye niche h code ka continuation






// 1st approach to connect to mongoose

// import express from "express";
// import mongoose from 'mongoose';
// import {DB_NAME} from './constants';
// const app = express();


// (
//     async () => {
//         try{
//             await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//             app.on("error",(error)=>{
//                 console.log("error:not able to talk to express",error);
//                 throw error;
//             })
//           app.listen(process.env.PORT,()=>{
//                 console.log(`server started at port ${process.env.PORT}`);
//           })  
//         }
//         catch(error){
//             console.log("error:not able to talk to mongoose",error);
//             throw error;
//     }}
// )()





 
//2nd approach to connect to mongoose 
//script m jake  dev  m  "-r dotenv/config --experimental-json-modules"  likhna h
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'
dotenv.config({
    path: './.env'
})



connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})


//  require('dotenv').config({path: './env'})
// import dotenv from "dotenv"
// import connectDB from "./db/index.js";
// import {app} from './app.js'
// dotenv.config({
//     path: './.env'
// })



// connectDB()
// .then(() => {
//     app.listen(8100, () => {
//         console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
//     })
// })
// .catch((err) => {
//     console.log("MONGO db connection failed !!! ", err);
// })

