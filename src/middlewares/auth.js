export const isLogin = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
};

export const isAdmin = (req, res, next) => {
    const user = req.user;

    if (user && user.role?.name === 'ADMIN') {
        return next();
    }

    return res.status(403).json({
        message: "Bạn không có quyền truy cập chức năng này."
    });
};
