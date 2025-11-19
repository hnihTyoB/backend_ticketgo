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
                errors: validation.error.issues.map(err => ({
                    path: err.path[0],
                    message: err.message
                }))
            });
        }

        const { email, password } = validation.data;
        const newUser = await registerUser({ email, password });

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
