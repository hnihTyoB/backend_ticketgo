import multer from "multer";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";

export const eventUploadMiddleware = (fieldName, dir, {
    maxWidth = 3840,
    maxHeight = 2160,
    minWidth = 1280,
    minHeight = 720,
    maxFileSize = 5
} = {}) => {
    return (req, res, next) => {
        const upload = multer({
            storage: multer.memoryStorage(),
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
                            path: "bannerUrl",
                            message: err.message
                        }
                    ],
                });
            }

            if (!req.file) {
                return next();
            }

            try {
                const metadata = await sharp(req.file.buffer).metadata();
                const { width, height } = metadata;

                if (width > maxWidth || height > maxHeight) {
                    return res.status(400).json({
                        errors: [
                            {
                                path: "bannerUrl",
                                message: `Kích thước ảnh quá lớn. Giới hạn: ${maxWidth}x${maxHeight}px, thu được: ${width}x${height}px`
                            }
                        ],
                    });
                }

                if (width < minWidth || height < minHeight) {
                    return res.status(400).json({
                        errors: [
                            {
                                path: "bannerUrl",
                                message: `Kích thước ảnh quá nhỏ. Giới hạn: ${minWidth}x${minHeight}px, thu được: ${width}x${height}px`
                            }
                        ],
                    });
                }

                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: `ticketgo/${dir}` },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });

                req.file.filename = uploadResult.secure_url;
                next();
            } catch (error) {
                return res.status(400).json({
                    errors: [
                        {
                            path: "bannerUrl",
                            message: "Lỗi xử lý ảnh: " + error.message
                        }
                    ],
                });
            }
        });
    };
};
