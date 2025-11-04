import { TOTAL_ITEM_PER_PAGE } from "../config/constant.js";
import {
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    prepareCartBeforeCheckout,
    handlePlaceOrder,
    orderHistory,
    ticketTypeInCart,
    calculateCartTotal,
    countTotalOrderPages
} from "../services/cart.service.js";
import {
    addToCartSchema,
    updateQuantitySchema,
    prepareCheckoutSchema,
    placeOrderSchema,
} from "../validation/cart.schema.js";


export const addTicketToCart = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            // redirect: "/login"
        });
    }

    try {
        const orderData = {
            ticketTypeId: Number(req.body.ticketTypeId),
            quantity: Number(req.body.quantity),
        };
        const validate = await addToCartSchema.safeParseAsync(orderData);
        if (!validate.success) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => ({
                    path: err.path[0],
                    message: err.message
                }))
            });
        }

        const { ticketTypeId, quantity } = validate.data;
        await addToCart(ticketTypeId, quantity, user.id);
        return res.status(200).json({ success: true, message: "Đã thêm vé vào giỏ hàng" });
    } catch (error) {
        console.error("AddTicketToCart error:", error);
        return res.status(500).json({ success: false, message: "Lỗi thêm vé vào giỏ hàng" });
    }
};

export const getCart = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            // redirect: "/login",
        });
    }

    try {
        const cartDetails = await ticketTypeInCart(user.id);
        const totalPrice = calculateCartTotal(cartDetails);
        const cartId = cartDetails.length ? cartDetails[0].cartId : null;

        return res.status(200).json({
            success: true,
            cartDetails,
            totalPrice,
            cartId
        });
    } catch (error) {
        console.error("GetCart error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy giỏ hàng"
        });
    }
};

export const updateQuantity = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            // redirect: "/login"
        });
    }

    try {
        const orderData = {
            cartDetailId: Number(req.body.cartDetailId),
            quantity: Number(req.body.quantity),
        };
        const validate = await updateQuantitySchema.safeParseAsync(orderData);
        if (!validate.success) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => ({
                    path: err.path[0],
                    message: err.message
                }))
            });
        }
        const { cartDetailId, quantity } = validate.data;
        await updateCartItemQuantity(cartDetailId, quantity, user.id);
        return res.status(200).json({ success: true, message: "Cập nhật số lượng thành công" });
    } catch (error) {
        console.error("UpdateQuantity error:", error);
        return res.status(500).json({ success: false, message: "Lỗi khi cập nhật số lượng" });
    }
}

export const removeTicketFromCart = async (req, res) => {
    const cartDetailId = Number(req.params.id);
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            // redirect: "/login"
        });
    }

    try {
        await removeFromCart(cartDetailId, user.id);
        return res.status(200).json({ success: true, message: "Đã xoá vé khỏi giỏ hàng" });
    } catch (error) {
        console.error("RemoveTicketFromCart error:", error);
        return res.status(500).json({ success: false, message: "Lỗi khi xoá vé khỏi giỏ hàng" });
    }
};

export const handleCartToCheckout = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            // redirect: "/login",
        });
    }
    try {
        const orderData = {
            cartId: Number(req.body.cartId),
            currentCartDetails: req.body.currentCartDetails || [],
            receiverName: req.body.receiverName,
            receiverPhone: req.body.receiverPhone,
            receiverEmail: req.body.receiverEmail || null,
        };
        const validate = await prepareCheckoutSchema.safeParseAsync(orderData);
        if (!validate.success) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => ({
                    path: err.path[0],
                    message: err.message
                }))
            });
        }
        const { cartId, currentCartDetails, receiverName, receiverPhone, receiverEmail } = validate.data;
        await prepareCartBeforeCheckout(currentCartDetails, cartId);
        return res.status(200).json({
            success: true,
            message: "Thông tin hợp lệ, chuyển sang trang thanh toán",
            data: {
                receiverName,
                receiverPhone,
                receiverEmail
            }
        });
    } catch (error) {
        console.error("HandleCartToCheckout error:", error);
        return res.status(500).json({ success: false, message: "Lỗi khi chuyển sang trang thanh toán" });
    }
};

export const checkOut = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            // redirect: "/login",
        });
    }

    try {
        const cartDetails = await ticketTypeInCart(user.id);
        const totalPrice = calculateCartTotal(cartDetails);

        return res.status(200).json({
            success: true,
            cartDetails,
            totalPrice
        });
    } catch (error) {
        console.error("CheckOut error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy thông tin thanh toán"
        });
    }
};

export const placeOrder = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            // redirect: "/login",
        });
    }

    try {
        const validatedData = placeOrderSchema.parse({
            receiverName: req.body.receiverName,
            receiverPhone: req.body.receiverPhone,
            receiverEmail: req.body.receiverEmail || req.body.receiverAddress || null,
            totalPrice: Number(req.body.totalPrice) || 0,
        });

        // Lấy giỏ hàng và tính lại totalPrice từ backend (không tin client)
        const cartDetails = await ticketTypeInCart(user.id);
        const calculatedTotalPrice = calculateCartTotal(cartDetails);

        const message = await handlePlaceOrder(
            user.id,
            validatedData.receiverName,
            validatedData.receiverPhone,
            validatedData.receiverEmail,
            calculatedTotalPrice // Dùng giá tính từ backend, không dùng từ client
        );

        if (message) {
            return res.status(400).json({
                success: false,
                message
            });
        }

        return res.status(200).json({
            success: true,
            message: "Đặt vé thành công",
            redirect: "/thanks",
        });
    } catch (error) {
        console.error("PlaceOrder error:", error);

        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: error.errors
            });
        }

        const statusCode = error.message.includes("trống") ? 400 :
            error.message.includes("không đủ") ? 409 :
                error.message.includes("không khớp") ? 400 :
                    error.message.includes("đã diễn ra") ? 400 : 500;

        return res.status(statusCode).json({
            success: false,
            message: error.message || "Lỗi khi đặt vé"
        });
    }
};

export const getThanks = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            // redirect: "/login"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Đặt vé thành công",
    });
};

export const getOrderHistory = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            // redirect: "/login"
        });
    }

    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || TOTAL_ITEM_PER_PAGE;

        const [orders, totalPages] = await Promise.all([
            orderHistory(user.id, page, limit),
            countTotalOrderPages(limit),
        ]);

        res.status(200).json({
            orders,
            totalPages,
        });
    } catch (err) {
        console.error("Lỗi khi lấy danh sách đơn hàng:", err);
        res.status(500).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};
