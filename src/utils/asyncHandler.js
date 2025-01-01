
// const asyncHandler=(fn)=>async (req,res,next)=>{
//     try{
//         await fn(req,res,next);
//     }catch(err){
//        res.status(err.code || 500).json({
//         sucess:false,
//         message:err.message || 'Internal Server Error'
//        })
//     }
// }

//const asyncHandler=(fn)=>asy()=>{}
const asyncHandler=(reqHandler)=>{
  return  (req,res,next)=>{
    //  middleware ko call krne k liye next() use hota h
        Promise.resolve(reqHandler(req,res,next)).catch((err)=>next(err))
    }
} 

export {asyncHandler};