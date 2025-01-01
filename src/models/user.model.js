import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
         lowercase: true,
        // help in seaching index is used when we have to search someting it make searching fast and optimize
        index: true,
    },
     email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
     },
     fullName:{
        type: String,
        required: true,
        trim: true,
    index: true,
     },
     avatar:{
        type: String,//cloudinary se lenge url
        required: true,
      
     },
     coverImage:{
       type: String,//cloudinary se lenge url 
     },
     watchHistory:[{
        type: Schema.Types.ObjectId,
        ref:"Video"
       
     }],
     password:{
        type: String,
        required: [true, "Password is required"],
     },
     refreshToken:{
        type: String,
     },

},{timestamps:true});

// pre hook middleware(kuch kam horha h ussse phele kuch krvana ho to pree hook use hoga) used to hash the password before saving it to the database
//pree m callback nhi use krte this ka kuch panga hota h isliye arrow function use nhi krte function , 10 salts/rounds h ki kitna hash krna h 
//
userSchema.pre("save",async function (next){
      if(this.isModified("password")){
         this.password = await bcrypt.hash(this.password,10);
      }
      next();
})
userSchema.methods.isPasswrdCorrtect = async function(password){
      return await bcrypt.compare(password,this.password);
   
}

// jwt ye ak brearer token  h mtlab chabi ki trha h jo kuch bejega m accept krlunga
//generateAccessToken and generateRefreshToken is used to generate access token and refresh token
userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
       {
           _id: this._id,
           email: this.email,
           username: this.username,
           fullName: this.fullName
       },
       process.env.ACCESS_TOKEN_SECRET,
       {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY
       }
   )
}
userSchema.methods.generateRefreshToken = function(){
   return jwt.sign(
       {
           _id: this._id,
           
       },
       process.env.REFRESH_TOKEN_SECRET,
       {
           expiresIn: process.env.REFRESH_TOKEN_EXPIRY
       }
   )
}
export const User = mongoose.model("User", userSchema);