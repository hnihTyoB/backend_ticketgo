import express from "express";
import { postCreateUser, getAllUsers, getUserById, putUpdateUser, deleteUser, getAllRoles } from "../controllers/user.controller.js";
import { fileUploadMiddleware } from "../middlewares/fileUpload.js";
import { deleteEvent, getAllEvents, getEventById, postCreateEvent, putUpdateEvent } from "../controllers/event.controller.js";
import { getAllOrders, getOrderById, putUpdateStatus } from "../controllers/order.controller.js";
import { successRedirect, userLogin, userLogout, userRegister } from "../controllers/auth.controller.js";
import { addTicketToCart, checkOut, getCart, getOrderHistory, getThanks, handleCartToCheckout, placeOrder, removeTicketFromCart, updateQuantity } from "../controllers/cart.controller.js";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { isAdmin, isLogin } from "../middlewares/auth.js";

export const apiRoutes = (app) => {
    const authRouter = express.Router();
    authRouter.post("/login", userLogin);
    authRouter.get("/success", successRedirect);
    authRouter.post("/register", userRegister);
    authRouter.post("/logout", userLogout);

    const userRouter = express.Router();
    userRouter.get("/", getAllUsers);
    userRouter.get("/roles", getAllRoles);
    userRouter.get("/:id", getUserById);
    userRouter.post("/", fileUploadMiddleware("avatar", "user"), postCreateUser);
    userRouter.put("/:id", fileUploadMiddleware("avatar", "user"), putUpdateUser);
    userRouter.delete("/:id", deleteUser);

    const eventRouter = express.Router();
    eventRouter.get("/", getAllEvents);
    eventRouter.get("/:id", getEventById);
    eventRouter.post("/", isAdmin, fileUploadMiddleware("image", "event"), postCreateEvent);
    eventRouter.put("/:id", isAdmin, fileUploadMiddleware("image", "event"), putUpdateEvent);
    eventRouter.delete("/:id", isAdmin, deleteEvent);

    const cartRouter = express.Router();
    cartRouter.get("/", getCart);
    cartRouter.post("/", addTicketToCart);
    cartRouter.put("/", updateQuantity);
    cartRouter.delete("/", removeTicketFromCart);
    cartRouter.post("/prepare-checkout", handleCartToCheckout);
    cartRouter.get("/checkout", checkOut);
    cartRouter.post("/place-order", placeOrder);
    cartRouter.get("/thanks", getThanks);
    cartRouter.get("/order-history", getOrderHistory);

    const orderRouter = express.Router();
    orderRouter.get("/", getAllOrders);
    orderRouter.get("/:id", getOrderById);
    orderRouter.put("/:id", putUpdateStatus);

    const dashboardRouter = express.Router();
    dashboardRouter.get("/count", getDashboard);

    app.use("/api/auth", authRouter);
    app.use("/api/users", isAdmin, userRouter);
    app.use("/api/events", eventRouter);
    app.use("/api/carts", isLogin, cartRouter);
    app.use("/api/orders", isAdmin, orderRouter);
    app.use("/api/dashboard", isAdmin, dashboardRouter);
};
