import { z } from "zod";
import { isEmailExist, isPhoneExist } from "../services/auth.service.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(0|\+84)[1-9][0-9]{8,14}$/;

const emailSchema = z
    .string()
    .trim()
    .refine((email) => emailRegex.test(email), {
        message: "Email không đúng định dạng",
        path: ["email"]
    })
    .refine(async (email) => {
        const existingUser = await isEmailExist(email);
        return !existingUser;
    }, {
        message: "Email đã tồn tại",
        path: ["email"]
    });

const phoneSchema = z
    .string()
    .trim()
    .refine((phone) => phoneRegex.test(phone), {
        message: "Số điện thoại không hợp lệ",
        path: ["phone"]
    })
    .refine(async (phone) => {
        const existingUser = await isPhoneExist(phone);
        return !existingUser;
    }, {
        message: "Số điện thoại đã tồn tại",
        path: ["phone"]
    });

export const loginSchema = z
    .object({
        username: z.string().trim().min(1, { message: "Tên đăng nhập không được để trống" }),
        password: z
            .string()
            .trim()
            .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
            .max(20, { message: "Mật khẩu không hợp lệ" }),
    });

export const registerSchema = z
    .object({
        email: emailSchema,
        password: z
            .string()
            .trim()
            .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
            .max(20, { message: "Mật khẩu không hợp lệ" }),
    })

export const createSchema = z
    .object({
        fullName: z.string().trim().min(1, { message: "Họ và tên không được để trống" }),
        email: emailSchema.optional(),
        phone: phoneSchema.optional(),
        birthDate: z
            .string()
            .trim()
            .refine((date) => !isNaN(Date.parse(date)), { message: "Ngày sinh không hợp lệ" }),
        gender: z.string().min(1, { message: "Giới tính không được để trống" }),
        roleId: z.number().min(1, "Vai trò không hợp lệ")
            .max(2, "Vai trò không hợp lệ").int("Vai trò không hợp lệ"),
        accountType: z.enum(["SYSTEM", "GOOGLE", "FACEBOOK"]).optional()
    })
    .refine((data) => data.email || data.phone, {
        message: "Cần có ít nhất email hoặc số điện thoại để tạo tài khoản",
        path: ["email"],
    });

export const updateSchema = z.object({
    fullName: z.string().trim().min(1, { message: "Họ và tên không được để trống" }),
    email: z
        .string()
        .trim()
        .email("Email không đúng định dạng")
        .optional(),
    phone: z
        .string()
        .trim()
        .refine((phone) => phoneRegex.test(phone), { message: "Số điện thoại không hợp lệ" })
        .optional(),
    birthDate: z
        .string()
        .trim()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Ngày sinh không hợp lệ" })
        .optional(),
    gender: z.string().min(1, { message: "Giới tính không được để trống" }).optional(),
    roleId: z.number().min(1, "Vai trò không hợp lệ")
        .max(2, "Vai trò không hợp lệ").int("Vai trò không hợp lệ"),
    accountType: z.enum(["SYSTEM", "GOOGLE", "FACEBOOK"]).optional()
});
