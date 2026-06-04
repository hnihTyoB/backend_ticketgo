import { handleUserLogin, registerUser, generateAccessToken, generateRefreshToken, findUserWithRoleById } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../validation/user.schema.js";
import jwt from "jsonwebtoken";

export const userLogin = async (req, res) => {
    try {
        const validation = await loginSchema.safeParseAsync(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validation.error.issues.map(err => ({
                    path: err.path[0],
                    message: err.message
                }))
            });
        }

        const { emailOrPhone, password } = validation.data;
        const loginResult = await handleUserLogin(emailOrPhone, password);
        if (!loginResult) {
            return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
        }
        const { accessToken, refreshToken, user } = loginResult;

        // Ghi Access Token vào cookie 'token'
        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 60 * 1000 // 30 phút
        });

        // Ghi Refresh Token vào cookie 'refreshToken'
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        res.json({ success: true, user, token: accessToken });
    } catch (err) {
        console.error("Login error:", err);
        res.status(401).json({ success: false, error: err.message });
    }
};

export const userRegister = async (req, res) => {
    try {
        const validation = await registerSchema.safeParseAsync(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validation.error.issues.map(err => ({
                    path: err.path[0],
                    message: err.message
                }))
            });
        }

        const { fullName, email, phone, password } = validation.data;
        const newUser = await registerUser(fullName, email, phone, password);

        res.status(201).json({
            message: "Đăng ký user thành công",
            user: newUser
        });
    } catch (err) {
        console.error("Register user error:", err);
        const msg = err?.message || "Lỗi server";
        res.status(400).json({ success: false, message: msg });
    }
};

export const userLogout = (req, res) => {
    // Xóa cả 2 cookie
    res.clearCookie("token");
    res.clearCookie("refreshToken");

    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error("Session destroy error:", err);
            }
        });
        res.clearCookie("connect.sid");
    }

    // TODO: Có thể thêm token vào blacklist ở đây
    // const token = req.headers.authorization?.split(' ')[1];
    // await addTokenToBlacklist(token);

    res.status(200).json({ success: true, message: "Đăng xuất thành công" });
};

export const getCurrentUser = (req, res) => {
    if (req.user) {
        let token = null;
        if (req.headers.cookie) {
            const cookies = req.headers.cookie.split(";").reduce((acc, cookie) => {
                const [key, val] = cookie.trim().split("=");
                acc[key] = val;
                return acc;
            }, {});
            token = cookies.token;
        }
        if (!token) {
            const authHeader = req.headers["authorization"];
            token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        }
        return res.json({ success: true, user: req.user, token });
    }
    return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
};

export const userRefreshToken = async (req, res) => {
    try {
        let refreshToken = null;
        if (req.headers.cookie) {
            const cookies = req.headers.cookie.split(";").reduce((acc, cookie) => {
                const [key, val] = cookie.trim().split("=");
                acc[key] = val;
                return acc;
            }, {});
            refreshToken = cookies.refreshToken;
        }

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "Thiếu Refresh Token" });
        }

        const refreshSecret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET ? process.env.JWT_SECRET + "_refresh" : "refresh_secret");

        const decoded = jwt.verify(refreshToken, refreshSecret);

        const user = await findUserWithRoleById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: "Người dùng không tồn tại" });
        }

        const newAccessToken = generateAccessToken(user);

        res.cookie("token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000 // 15 phút
        });

        return res.json({ success: true, token: newAccessToken });
    } catch (err) {
        console.error("Refresh token error:", err.message);
        return res.status(401).json({ success: false, message: "Refresh Token không hợp lệ hoặc đã hết hạn" });
    }
};
