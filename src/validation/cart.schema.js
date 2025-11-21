import { z } from "zod";

const phoneRegex = /^(0|\+84)[1-9][0-9]{8,14}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const addToCartSchema = z.object({
    ticketTypeId: z
        .number()
        .int("ID loại vé phải là số nguyên")
        .positive("ID loại vé không hợp lệ"),
    quantity: z
        .number()
        .int("Số lượng phải là số nguyên")
        .min(1, "Số lượng phải lớn hơn 0")
        .max(100, "Số lượng không được vượt quá 100"),
});

export const updateQuantitySchema = z.object({
    cartDetailId: z
        .number()
        .int("ID chi tiết giỏ hàng phải là số nguyên")
        .positive("ID chi tiết giỏ hàng không hợp lệ"),
    quantity: z
        .number()
        .int("Số lượng phải là số nguyên")
        .min(0, "Số lượng không được âm")
        .max(100, "Số lượng không được vượt quá 100"),
});

export const prepareCheckoutSchema = z.object({
    cartId: z
        .number()
        .int("ID giỏ hàng phải là số nguyên")
        .positive("ID giỏ hàng không hợp lệ"),
    currentCartDetails: z
        .array(
            z.object({
                id: z.number().int().positive(),
                quantity: z.number().int().min(1),
            })
        )
        .min(1, "Giỏ hàng không được trống"),
    receiverName: z
        .string()
        .trim()
        .min(1, "Họ và tên không được để trống")
        .max(255, "Tên người nhận không được quá 255 ký tự"),
    receiverPhone: z
        .string()
        .trim()
        .min(1, { message: "Số điện thoại không được để trống" })
        .refine((phone) => phoneRegex.test(phone), {
            message: "Số điện thoại không hợp lệ",
        }),
    receiverEmail: z
        .string()
        .trim()
        .min(1, { message: "Email không được để trống" })
        .refine((email) => !email || emailRegex.test(email), {
            message: "Email không đúng định dạng",
        }),
});