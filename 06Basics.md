# How to upload file in the backend

Create a free account at Cloudinary. Next open terminal and type this
```bash
npm i cloudinary multer
```
Click on "View API Keys" in the website and save it in .env file, i.e., write these 
```bash
CLOUDINARY_CLOUD_NAME=dykk7mrx
CLOUDINARY_API_KEY=38996747474611
CLOUDINARY_API_SECRET=a7ExB0xk_QmS3HfqHdnc9-dxas
```

Inside src directory create a folder named utils and inside it a file named cloudinary.js. Inside cloudinary.js write this:
```javascript
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export default uploadOnCloudinary;
```

Now inside src create a directory named middlewares and inside it a file named multer.middleware.js. In multer.middleware.js write this:
```javascript
import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage: storage,
});
```
