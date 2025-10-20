import { z } from "zod";

export const ticketTypeSchema = z.object({
    type: z.string()
        .min(1, "Loại vé không được để trống")
        .max(100, "Loại vé không được quá 100 ký tự"),
    price: z.number()
        .int("Giá vé phải là số nguyên")
        .min(0, "Giá vé không được âm"),
    quantity: z.number()
        .int("Số lượng phải là số nguyên")
        .min(1, "Số lượng phải lớn hơn 0"),
    description: z.string()
        .trim()
        .min(5, "Mô tả vé phải có ít nhất 5 ký tự")
        .max(255, "Mô tả vé không được quá 255 ký tự")
});
