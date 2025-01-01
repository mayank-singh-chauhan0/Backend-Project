import { v2 as cloudinary } from 'cloudinary';  
  // fs mean file system ye node js k sat default aati h
import fs from 'fs';


cloudinary.config({ 
    cloud_name: 'dy8fnynd1', 
    api_key: '617439124642315', 
    api_secret: 'HB7yTx_S4jDKWgepipBdzykCwUE' // Click 'View API Keys' above to copy your API secret
});
    

    export const uploadOnCloudinary = async(localFilePath) => {
       try {
        if(!localFilePath) return null;
        const response=await cloudinary.uploader.upload(localFilePath ,{
            resource_type:"auto"
        })
       //file uploaded
    //    console.log("file is uploaded on", response.url)

        return response;

       } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved file bcz operation is failed
        return null;
       }

    }
   