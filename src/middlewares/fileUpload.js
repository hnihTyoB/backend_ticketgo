import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import fs from "fs";

export const fileUploadMiddleware = (fieldName, dir, {
    maxWidth = 3840,
    maxHeight = 2160,
    minWidth = 1280,
    minHeight = 720,
    maxFileSize = 5
} = {}) => {
    return (req, res, next) => {
        const upload = multer({
            storage: multer.diskStorage({
                destination: "public/images/" + dir,
                filename: (req, file, cb) => {
                    cb(null, uuidv4() + path.extname(file.originalname));
                }
            }),
            limits: {
                fileSize: 1024 * 1024 * maxFileSize
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

        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return next();
            }

            try {
                const metadata = await sharp(req.file.path).metadata();
                const { width, height } = metadata;

                if (width > maxWidth || height > maxHeight) {
                    fs.unlinkSync(req.file.path);
                    return res.status(400).json({
                        message: `Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}px, got: ${width}x${height}px`
                    });
                }

                if (width < minWidth || height < minHeight) {
                    fs.unlinkSync(req.file.path);
                    return res.status(400).json({
                        message: `Image dimensions too small. Minimum: ${minWidth}x${minHeight}px, got: ${width}x${height}px`
                    });
                }
                next();
            } catch (error) {
                if (req.file && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({ message: "Error processing image: " + error.message });
            }
        });
    };
};
