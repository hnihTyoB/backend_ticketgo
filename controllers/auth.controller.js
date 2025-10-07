import express from "express";
import { handleUserLogin, registerUser } from "../services/auth.service.js";
import { RegisterSchema } from "../validation/register.schema.js";

const router = express.Router();

export const userLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const token = await handleUserLogin(username, password);
        res.json({ token });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

export const userRegister = async (req, res) => {
    try {
        const validate = await RegisterSchema.safeParseAsync(req.body);
        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => `${err.message}`)
            });
        }
        const { email, password } = validate.data;
        const newUser = await registerUser(
            email, password
        );
        res.status(201).json({ message: "Đăng ký user thành công", user: newUser });
    } catch (err) {
        console.error("Register user error:", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const successRedirect = (req, res) => {
    const user = req.user;
    if (user?.role?.name === 'Admin') {
        res.redirect('/admin');
    } else {
        res.redirect('/user');
    }
}

export const userLogout = (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
}

export default router;
