export const isLogin = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({
        message: "You are not logged in.",
        // redirect: "/login"
    });
};

export const isAdmin = (req, res, next) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            message: "You are not logged in.",
            // redirect: "/login"
        });
    }

    if (user.role?.name === "ADMIN") {
        return next();
    }

    return res.status(403).json({
        message: "You do not have permission to access this function.",
        // redirect: "/"
    });
};

