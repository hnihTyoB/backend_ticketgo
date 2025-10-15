import { z } from "zod";
import { isEmailExist } from "../services/auth.service.js";

const emailSchema = z
    .string()
    .trim()
    .email("Email không đúng định dạng")
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
    .min(9, { message: "Số điện thoại phải có ít nhất 9 ký tự" })
    .max(15, { message: "Số điện thoại không hợp lệ" });

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
        phone: z
            .string()
            .trim()
            .min(9, { message: "Số điện thoại phải có ít nhất 9 ký tự" })
            .max(15, { message: "Số điện thoại không hợp lệ" })
            .optional(),
        birthDate: z
            .string()
            .trim()
            .refine((date) => !isNaN(Date.parse(date)), { message: "Ngày sinh không hợp lệ" }),
        gender: z.enum(["Nam", "Nữ", "Khác"], { message: "Giới tính không hợp lệ" }),
        roleId: z.string().trim().min(1, { message: "Vai trò không được để trống" }),
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
    phone: phoneSchema.optional(),
    birthDate: z
        .string()
        .trim()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Ngày sinh không hợp lệ" })
        .optional(),
    gender: z.enum(["Nam", "Nữ", "Khác"]).optional(),
    roleId: z.string().optional(),
});
