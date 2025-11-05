export const isLogin = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({
        message: "Bạn chưa đăng nhập.",
        // redirect: "/login"
    });
};

export const isAdmin = (req, res, next) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Bạn chưa đăng nhập.",
            // redirect: "/login"
        });
    }

    if (user.role?.name === "ADMIN") {
        return next();
    }

    return res.status(403).json({
        message: "Bạn không có quyền truy cập vào chức năng này.",
        // redirect: "/"
    });
};

export const isOwnerOrAdmin = (req, res, next) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "Bạn chưa đăng nhập.",
            // redirect: "/login"
        });
    }

    if (user.role?.name === "ADMIN") {
        return next();
    }

    const requestedUserId = parseInt(req.params.id);
    if (user.id === requestedUserId) {
        return next();
    }

    return res.status(403).json({
        message: "Bạn không có quyền truy cập vào tài nguyên này.",
        // redirect: "/"
    });
};

