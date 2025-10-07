import express from "express";
import { successRedirect, userLogin, userLogout, userRegister } from "../controllers/auth.controller.js";
// import passport from "passport";
import { createUser, deleteUser, getAllRoles, getAllUsers, getUserById, updateUser } from "../controllers/user.controller.js";
import fileUploadMiddleware from "../middlewares/fileUpload.js";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/product.controller.js";
import { getAllOrders, getOrderById, updateStatus } from "../controllers/order.controller.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

export const apiRoutes = (app) => {
    // --- Auth Router ---
    const authRouter = express.Router();
    // Bạn có 2 route POST /login, điều này không đúng.
    // Nếu bạn dùng passport-local cho session, hãy dùng nó.
    // Nếu bạn trả về token (như trong userLogin), hãy dùng controller đó.
    // Ở đây tôi giả định bạn muốn dùng token-based auth cho API.
    authRouter.post("/login", userLogin);
    // Route này dùng cho session-based auth với redirect, không phù hợp với API trả về JSON.
    // authRouter.post("/login-session", passport.authenticate('local', {
    //     successRedirect: '/success',
    //     failureRedirect: '/login',
    //     failureMessage: true
    // }));
    authRouter.get("/success", successRedirect); // Dành cho session
    authRouter.post("/register", userRegister);
    // Nên dùng POST cho logout để tuân thủ REST standard
    authRouter.post("/logout", userLogout);

    // --- User Router ---
    const userRouter = express.Router();
    userRouter.get("/", getAllUsers);
    userRouter.get("/roles", getAllRoles); // Đặt route cụ thể lên trước route động
    userRouter.get("/:id", getUserById);
    userRouter.post("/", fileUploadMiddleware("avatar", "user"), createUser);
    userRouter.put("/:id", fileUploadMiddleware("avatar", "user"), updateUser);
    userRouter.delete("/:id", deleteUser);

    // --- Product Router ---
    const productRouter = express.Router();
    productRouter.get("/", getAllProducts);
    // router.get("/factories", getAllFactories);
    // router.get("/targets", getAllTargets);
    productRouter.get("/:id", getProductById);
    productRouter.post("/", fileUploadMiddleware("image", "product"), createProduct);
    productRouter.put("/:id", fileUploadMiddleware("image", "product"), updateProduct);
    productRouter.delete("/:id", deleteProduct);

    // --- Order Router ---
    const orderRouter = express.Router();
    orderRouter.get("/", getAllOrders);
    orderRouter.get("/:id", getOrderById);
    orderRouter.put("/:id/status", updateStatus);

    // --- Dashboard Router ---
    const dashboardRouter = express.Router();
    dashboardRouter.get("/count", getDashboard);

    app.use("/api/auth", authRouter);
    app.use("/api/users", userRouter);
    app.use("/api/products", productRouter);
    app.use("/api/orders", orderRouter);
    app.use("/api/dashboard", dashboardRouter);
}