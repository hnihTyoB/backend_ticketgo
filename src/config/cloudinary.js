import { v2 as cloudinary } from "cloudinary";

/**
 * URL: https://res.cloudinary.com/xxx/image/upload/v123/ticketgo/users/abc123.jpg
 * Public ID: ticketgo/users/abc123
 */
export const destroyCloudinaryImage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes("cloudinary.com")) return;

    try {
        const uploadIndex = imageUrl.indexOf("/upload/");
        if (uploadIndex === -1) return;

        const pathAfterUpload = imageUrl.substring(uploadIndex + "/upload/".length);

        // Bỏ version prefix (v123/) nếu có
        const withoutVersion = pathAfterUpload.replace(/^v\d+\//, "");

        // Bỏ phần mở rộng file (.jpg, .png, ...)
        const publicId = withoutVersion.substring(0, withoutVersion.lastIndexOf("."));

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Lỗi xóa ảnh trên Cloudinary:", error);
    }
};
