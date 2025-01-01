import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';



const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// ab configure kr rhe h ki server json data accept krega vgream with the help of middleware  // koi request aai to aap capable ho ya nhi us req k liye yecheck krta h middleware

// ye middleware h jo json data ko parse krke req.body me dal deta h phele body parse install krna pdta tha ab jarurat nhi h
// app.use(express.json({limit: '16kb'}));

// //ye url k data ko decode krta h  extende jaruri nhi h pr isse aap opject k ander object de skte ho limit bhi lga skte ho
// app.use(express.urlencoded({extended:true}));

// // like public assets file vgra store krne k liye public folder bnaya h usme store k liye h vo
// app.use(express.static('public'));

// // server se browser ki cookie access krne k liye cookie parser use krte h
// app.use(cookieParser());
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
//routes import
import userRouter from './routes/user.routes.js';


//routes declaration
app.use("/api/v1/users",userRouter)

export { app }