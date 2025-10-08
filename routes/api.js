import express from "express";
import { successRedirect, userLogin, userLogout, userRegister } from "../controllers/auth.controller.js";
import { createUser, deleteUser, getAllRoles, getAllUsers, getUserById, updateUser } from "../controllers/user.controller.js";
import fileUploadMiddleware from "../middlewares/fileUpload.js";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct, } from "../controllers/product.controller.js";
import { getAllOrders, getOrderById, updateStatus } from "../controllers/order.controller.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

export const apiRoutes = (app) => {
    // Auth
    const authRouter = express.Router();
    authRouter.post("/login", userLogin);
    authRouter.get("/success", successRedirect);
    authRouter.post("/register", userRegister);
    authRouter.post("/logout", userLogout);

    // User
    const userRouter = express.Router();
    userRouter.get("/", getAllUsers);
    userRouter.get("/roles", getAllRoles);
    userRouter.get("/:id", getUserById);
    userRouter.post("/", fileUploadMiddleware("avatar", "user"), createUser);
    userRouter.put("/:id", fileUploadMiddleware("avatar", "user"), updateUser);
    userRouter.delete("/:id", deleteUser);

    // Product
    const productRouter = express.Router();
    productRouter.get("/", getAllProducts);
    // router.get("/factories", getAllFactories);
    // router.get("/targets", getAllTargets);
    productRouter.get("/:id", getProductById);
    productRouter.post("/", fileUploadMiddleware("image", "product"), createProduct);
    productRouter.put("/:id", fileUploadMiddleware("image", "product"), updateProduct);
    productRouter.delete("/:id", deleteProduct);

    // Order
    const orderRouter = express.Router();
    orderRouter.get("/", getAllOrders);
    orderRouter.get("/:id", getOrderById);
    orderRouter.put("/:id/status", updateStatus);

    // Dashboard
    const dashboardRouter = express.Router();
    dashboardRouter.get("/count", getDashboard);

    app.use("/api/auth", authRouter);
    app.use("/api/users", userRouter);
    app.use("/api/products", productRouter);
    app.use("/api/orders", orderRouter);
    app.use("/api/dashboard", dashboardRouter);

}