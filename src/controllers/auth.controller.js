import { handleUserLogin, registerUser } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../validation/user.schema.js";

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
        const token = await handleUserLogin(emailOrPhone, password);
        if (!token) {
            return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
        }
        res.json({ token, success: true });
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
    // Với JWT, không cần xử lý session
    // Có thể thêm logic blacklist token ở đây nếu cần

    // Nếu có session, xóa nó
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
