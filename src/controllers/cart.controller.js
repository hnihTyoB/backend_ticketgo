import { TOTAL_ITEM_PER_PAGE } from "../config/constant.js";
import {
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    prepareCartBeforeCheckout,
    handlePlaceOrder,
    ticketTypeInCart,
    calculateCartTotal,
    countTotalCartPages,
    completePayment,
    handlePaymentFailure,
    clearCart,
    handleRetryPayment
} from "../services/cart.service.js";
import { createPaymentUrl, verifyReturnUrl } from "../services/vnpay.service.js";
import process from "process";
import {
    addToCartSchema,
    updateQuantitySchema,
    prepareCheckoutSchema,
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

export const addMultipleTicketsToCart = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            // redirect: "/login"
        });
    }

    try {
        const tickets = req.body.tickets; // Expecting an array of { ticketTypeId, quantity }
        for (const ticket of tickets) {
            const validate = await addToCartSchema.safeParseAsync({
                ticketTypeId: Number(ticket.ticketTypeId),
                quantity: Number(ticket.quantity),
            });
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
        }
        return res.status(200).json({ success: true, message: "Đã thêm vé vào giỏ hàng" });
    } catch (error) {
        console.error("AddMultipleTicketsToCart error:", error);
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
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || TOTAL_ITEM_PER_PAGE;
        const [cartDetails, totalPages] = await Promise.all([
            ticketTypeInCart(user.id, page, limit),
            countTotalCartPages(user.id, limit),
        ]);

        const cartId = cartDetails.length > 0 ? cartDetails[0].cartId : null;

        return res.status(200).json({
            success: true,
            cartId,
            cartDetails,
            totalPages,
        });
    } catch (error) {
        console.error("GetCart error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi lấy giỏ hàng"
        });
    }
};

export const getCartWithFilter = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
            // redirect: "/login",
        });
    }

    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || TOTAL_ITEM_PER_PAGE;

        const cartDetails = await ticketTypeInCart(user.id, page, limit);

        return res.status(200).json({
            success: true,
            cartDetails,
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

// export const removeTicketFromCart = async (req, res) => {
//     const cartDetailId = Number(req.params.id);
//     const user = req.user;

//     if (!user) {
//         return res.status(401).json({
//             success: false,
//             message: "Bạn chưa đăng nhập",
//             // redirect: "/login"
//         });
//     }

//     try {
//         await removeFromCart(cartDetailId, user.id);
//         return res.status(200).json({ success: true, message: "Đã xoá vé khỏi giỏ hàng" });
//     } catch (error) {
//         console.error("RemoveTicketFromCart error:", error);
//         return res.status(500).json({ success: false, message: "Lỗi khi xoá vé khỏi giỏ hàng" });
//     }
// };

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
            receiverEmail: req.body.receiverEmail,
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

export const clearCartHandler = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
        });
    }

    try {
        await clearCart(user.id);
        return res.status(200).json({ success: true, message: "Đã xóa toàn bộ giỏ hàng" });
    } catch (error) {
        console.error("ClearCart error:", error);
        return res.status(500).json({ success: false, message: error.message || "Lỗi khi xóa giỏ hàng" });
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
        // Lấy giỏ hàng và tính lại totalPrice từ backend (không tin client)
        const cartDetails = await ticketTypeInCart(user.id);
        const calculatedTotalPrice = calculateCartTotal(cartDetails);

        // Tạo order tạm thời
        const { orderId, error } = await handlePlaceOrder(
            user.id,
            req.body.receiverName,
            req.body.receiverPhone,
            req.body.receiverEmail,
            calculatedTotalPrice,
            req.body.paymentMethod,
        );

        if (error) {
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || "127.0.0.1";
        const backendUrl = process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 9092}`;
        const returnUrl = `${backendUrl}/api/carts/vnpay-callback`;

        const paymentUrl = createPaymentUrl({
            amount: calculatedTotalPrice,
            orderId: orderId,
            orderInfo: `Thanh toán đơn hàng #${orderId}`,
            ipAddr: clientIp,
            returnUrl: returnUrl,
        });

        return res.status(200).json({
            success: true,
            message: "Tạo đơn hàng thành công. Vui lòng thanh toán.",
            paymentUrl: paymentUrl,
            orderId: orderId,
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
        redirect: "/thanks",
    });
};

export const vnpayCallback = async (req, res) => {
    try {
        const verifyResult = verifyReturnUrl(req.query);

        if (!verifyResult.isVerified) {
            console.error("VNPAY callback verification failed:", verifyResult);
            const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT || 5173}`;
            return res.redirect(`${frontendUrl}/checkout?error=verification_failed`);
        }

        const orderId = verifyResult.transactionRef ? Number(verifyResult.transactionRef) : null;
        const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT || 5173}`;

        if (!orderId) {
            console.error("Cannot get orderId from VNPAY callback");
            return res.redirect(`${frontendUrl}/checkout?error=invalid_order`);
        }

        if (verifyResult.isSuccess) {
            console.log(`Payment success for order ${orderId}`);

            const { success, error } = await completePayment(orderId, verifyResult.transactionRef);

            if (success) {
                return res.redirect(`${frontendUrl}/thanks?orderId=${orderId}`);
            } else {
                console.error(`Complete payment failed for order ${orderId}:`, error);
                return res.redirect(`${frontendUrl}/checkout?error=payment_processing_failed&orderId=${orderId}`);
            }
        } else {
            console.log(`Payment failed for order ${orderId}:`, verifyResult.message);

            await handlePaymentFailure(orderId);

            return res.redirect(`${frontendUrl}/checkout?error=payment_failed&orderId=${orderId}`);
        }
    } catch (error) {
        console.error("VNPAY callback error:", error);
        const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT || 5173}`;
        return res.redirect(`${frontendUrl}/checkout?error=callback_error`);
    }
};

export const vnpayNotify = async (req, res) => {
    try {
        const query = Object.keys(req.query).length ? req.query : req.body;
        const verifyResult = verifyReturnUrl(query);

        if (!verifyResult.isVerified) {
            console.error('VNPAY notify verification failed:', verifyResult);
            return res.status(400).send('Invalid signature');
        }

        const orderId = verifyResult.transactionRef ? Number(verifyResult.transactionRef) : null;
        if (!orderId) return res.status(400).send('Invalid order');

        if (verifyResult.isSuccess) {
            await completePayment(orderId, verifyResult.transactionRef);
        } else {
            await handlePaymentFailure(orderId);
        }

        return res.status(200).send('OK');
    } catch (error) {
        console.error('VNPAY notify error:', error);
        return res.status(500).send('ERROR');
    }
};

export const retryPayment = async (req, res) => {
    const user = req.user;
    const { orderId } = req.params;

    if (!user) {
        return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập" });
    }

    try {
        const { order, error } = await handleRetryPayment(orderId, user.id);

        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || "127.0.0.1";
        const backendUrl = process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 9092}`;
        const returnUrl = `${backendUrl}/api/carts/vnpay-callback`;

        const paymentUrl = createPaymentUrl({
            amount: order.totalPrice,
            orderId: order.id,
            orderInfo: `Thanh toán lại đơn hàng #${order.id}`,
            ipAddr: clientIp,
            returnUrl: returnUrl,
        });

        return res.status(200).json({
            success: true,
            message: "Tạo lại link thanh toán thành công.",
            paymentUrl: paymentUrl,
            orderId: order.id,
        });

    } catch (error) {
        console.error("RetryPayment error:", error);
        return res.status(500).json({ success: false, message: "Lỗi khi thử thanh toán lại." });
    }
};