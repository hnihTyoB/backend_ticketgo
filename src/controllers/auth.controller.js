import { handleUserLogin, registerUser } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../validation/user.schema.js";

export const userLogin = async (req, res) => {
    try {
        const validation = await loginSchema.safeParseAsync(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validation.error.issues.map(err => err.message)
            });
        }

        const { username, password } = validation.data;
        const token = await handleUserLogin(username, password);
        if (!token) {
            return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
        }
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const userRegister = async (req, res) => {
    try {
        const validation = await registerSchema.safeParseAsync(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validation.error.issues.map(err => err.message)
            });
        }

        const { email, password } = validation.data;
        const newUser = await registerUser(email, password);

        res.status(201).json({
            message: "Đăng ký user thành công",
            user: newUser
        });
    } catch (err) {
        console.error("Register user error:", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const successRedirect = (req, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "User chưa đăng nhập" });

    if (user.role?.name === "Admin") {
        return res.redirect("/admin");
    } else {
        return res.redirect("/user");
    }
};

export const userLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Logout thất bại", error: err.message });
        }
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Đăng xuất thành công" });
    });
};
