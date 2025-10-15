import jwt from "jsonwebtoken";
import process from "process";

export const checkValidJWT = (req, res, next) => {
    const whitelist = [
        "/auth/login",
        "/auth/register",
        "/products",
    ];

    if (whitelist.some(path => req.path.startsWith(path))) {
        return next();
    }

    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({
            data: null,
            message: "Thiếu token xác thực",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            username: decoded.username,
            fullName: decoded.fullName,
            accountType: decoded.accountType,
            avatar: decoded.avatar,
            roleId: decoded.roleId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        res.status(401).json({
            data: null,
            message: "Token không hợp lệ hoặc đã hết hạn sử dụng",
        });
    }
};
