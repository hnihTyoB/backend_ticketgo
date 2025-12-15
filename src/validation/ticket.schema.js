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
    description: z.string().max(1000, "Mô tả không được quá 1000 ký tự").optional(),
});
