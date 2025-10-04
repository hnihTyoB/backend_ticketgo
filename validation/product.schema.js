import { z } from "zod";

export const productSchema = z.object({
    name: z.string().trim().min(1, "Tên sản phẩm là bắt buộc"),
    price: z
        .string()
        .transform((val) => (val === "" ? 0 : Number(val)))
        .refine((num) => num > 0, {
            message: "Giá sản phẩm phải lớn hơn 0",
        }),
    detailDesc: z.string().min(10, "Mô tả chi tiết phải có ít nhất 10 ký tự"),
    shortDesc: z.string().min(5, "Mô tả ngắn phải có ít nhất 5 ký tự"),
    quantity: z
        .string()
        .transform((val) => (val === "" ? 0 : Number(val)))
        .refine((num) => num > 0, {
            message: "Số lượng tối thiểu là 1",
        }),
    factory: z.string().min(1, "Thương hiệu là bắt buộc"),
    target: z.string().min(1, "Đối tượng sử dụng là bắt buộc"),
});
