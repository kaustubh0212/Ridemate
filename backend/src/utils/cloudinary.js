import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { v2 as cloudinary} from "cloudinary";
import fs from "fs"


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath)
        {
            return null;
        }

        //uploading the file on cloudinary
        const response = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type: "image"
            }
        )

        console.log("File is uploaded on cloudinary ", response.url)
        fs.unlinkSync(localFilePath) // delete file in public folder
        return response;
    } catch (error){
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export { uploadOnCloudinary }