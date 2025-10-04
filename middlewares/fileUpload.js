import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const fileUploadMiddleware = (fieldName, dir = "avatar") => {
    return multer({
        storage: multer.diskStorage({
            destination: "public/images/" + dir,
            filename: (req, file, cb) => {
                cb(null, uuidv4() + path.extname(file.originalname));
            }
        }),
        limits: {
            fileSize: 1024 * 1024 * 3 // 3MB
        },
        fileFilter: (req, file, cb) => {
            if (
                file.mimetype === "image/png" ||
                file.mimetype === "image/jpg" ||
                file.mimetype === "image/jpeg"
            ) {
                cb(null, true);
            } else {
                cb(new Error("Only JPEG and PNG images are allowed."), false);
            }
        }
    }).single(fieldName);
};

export default fileUploadMiddleware;
