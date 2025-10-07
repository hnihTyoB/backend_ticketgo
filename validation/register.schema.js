import { z } from 'zod';
import { isEmailExist } from '../services/auth.service.js';

const passwordSchema = z
    .string()
    .trim()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(20, "Mật khẩu không được quá 20 ký tự");

const emailSchema = z
    .string()
    .email("Email không đúng định dạng")
    .refine(async (email) => {
        const exitingUser = await isEmailExist(email);
        return !exitingUser;
    }, {
        message: "Email đã tồn tại",
        path: ["email"]
    });

export const RegisterSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"]
});

export const CreateSchema = z.object({
    fullName: z.string().trim().min(1, { message: "Họ tên không được để trống" }),
    username: emailSchema,
    phone: z.string().trim().min(1, { message: "Số điện thoại không được để trống" }),
    role: z.string().min(1, { message: "Vai trò không được để trống" }),
    address: z.string().optional(),
});

export const updateSchema = z.object({
    fullName: z.string().trim().min(1, { message: "Họ tên không được để trống" }),
    phone: z.string().trim().min(1, { message: "Số điện thoại không được để trống" }),
    roleId: z.string().min(1, { message: "Vai trò không được để trống" }),
    address: z.string().optional(),
});
