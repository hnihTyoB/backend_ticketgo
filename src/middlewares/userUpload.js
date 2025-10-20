import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import fs from "fs";

export const userUploadMiddleware = (
    fieldName,
    dir,
    {
        maxWidth = 512,
        maxHeight = 512,
        minWidth = 100,
        minHeight = 100,
        maxFileSize = 1
    } = {}
) => {
    return (req, res, next) => {
        const upload = multer({
            storage: multer.diskStorage({
                destination: "../ticket-go-ptit/public/images/" + dir,
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
                    cb(new Error("Chỉ chấp nhận ảnh JPEG và PNG."), false);
                }
            }
        }).single(fieldName);

        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    errors: [
                        {
                            path: "avatar",
                            message: err.message
                        }
                    ],
                });
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
                        errors: [
                            {
                                path: "avatar",
                                message: `Kích thước ảnh quá lớn. Giới hạn: ${maxWidth}x${maxHeight}px, thu được: ${width}x${height}px`
                            }
                        ],
                    });
                }

                if (width < minWidth || height < minHeight) {
                    fs.unlinkSync(req.file.path);
                    return res.status(400).json({
                        errors: [
                            {
                                path: "avatar",
                                message: `Kích thước ảnh quá nhỏ. Giới hạn: ${minWidth}x${minHeight}px, thu được: ${width}x${height}px`
                            }
                        ],
                    });
                }
                next();
            } catch (error) {
                if (req.file && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({
                    errors: [
                        {
                            path: "avatar",
                            message: "Lỗi xử lý ảnh: " + error.message
                        }
                    ],
                });
            }
        });
    };
};
