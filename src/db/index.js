import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";


const connectDB= async ()=>{
    try{
        //console log krao connectionInstance ko assignement
      const connectionInstance=  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // console.log(`\n connected to ${connectionInstance.connection.host}`) 
        //tell us which host are you connected
        // console.log(connectionInstance)
        // console.log(connectionInstance.connection)
    }
    catch(error){
        console.log("error:not able to talk to mongoose",error);
         process.exit(1); 
    }
}


export default connectDB;