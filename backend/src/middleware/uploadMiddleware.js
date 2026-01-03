const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Fallback to Disk Storage if Cloudinary is not properly configured
const useCloudinary = false; // FORCE LOCAL STORAGE FOR DEBUGGING
console.log("Upload Middleware: Using Cloudinary?", useCloudinary);

let storage;

if (useCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'globetrotter_trips',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        },
    });
} else {
    // Local Disk Storage
    console.log("Upload Middleware: Initializing Disk Storage in", path.resolve(uploadDir));
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
        }
    })
}

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };
