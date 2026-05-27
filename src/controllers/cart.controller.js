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
import { createZaloPayPaymentUrl, verifyZaloPayRedirect, verifyZaloPayCallback } from "../services/zalopay.service.js";
import { createMoMoPaymentUrl, verifyMoMoSignature } from "../services/momo.service.js";
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

        const paymentMethod = req.body.paymentMethod || "ZALOPAY";

        // Tạo order tạm thời
        const { orderId, error } = await handlePlaceOrder(
            user.id,
            req.body.receiverName,
            req.body.receiverPhone,
            req.body.receiverEmail,
            calculatedTotalPrice,
            paymentMethod,
        );

        if (error) {
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        let paymentUrl = null;
        const backendUrl = process.env.BACKEND_URL;

        if (paymentMethod === "ZALOPAY") {
            const returnUrl = `${backendUrl}/api/carts/zalopay-callback`;

            paymentUrl = await createZaloPayPaymentUrl({
                amount: calculatedTotalPrice,
                orderId: orderId,
                orderInfo: `Thanh toán đơn hàng #${orderId}`,
                returnUrl: returnUrl,
            });
        } else if (paymentMethod === "MOMO") {
            const returnUrl = `${backendUrl}/api/carts/momo-callback`;

            paymentUrl = await createMoMoPaymentUrl({
                amount: calculatedTotalPrice,
                orderId: orderId,
                orderInfo: `Thanh toán đơn hàng #${orderId}`,
                returnUrl: returnUrl,
            });
        } else {
            // Đối với các phương thức thanh toán mock khác (VIETQR, SHOPEEPAY, CARD)
            // Giả lập thanh toán thành công và chuyển hướng trực tiếp
            const frontendUrl = process.env.FRONTEND_URL;
            await completePayment(orderId, `MOCK_${paymentMethod}_${Date.now()}`);
            paymentUrl = `${frontendUrl}/thanks?orderId=${orderId}`;
        }

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

export const zalopayCallback = async (req, res) => {
    try {
        const verifyResult = verifyZaloPayRedirect(req.query);

        const orderId = verifyResult.orderId ? Number(verifyResult.orderId) : null;
        const frontendUrl = process.env.FRONTEND_URL;

        if (!orderId) {
            console.error("Cannot get orderId from ZaloPay callback");
            return res.redirect(`${frontendUrl}/checkout?error=invalid_order`);
        }

        if (verifyResult.isSuccess) {
            console.log(`ZaloPay payment success for order ${orderId}`);

            const { success, error } = await completePayment(orderId, verifyResult.transactionRef);

            if (success) {
                return res.redirect(`${frontendUrl}/thanks?orderId=${orderId}`);
            } else {
                console.error(`Complete payment failed for order ${orderId}:`, error);
                return res.redirect(`${frontendUrl}/checkout?error=payment_processing_failed&orderId=${orderId}`);
            }
        } else {
            console.log(`ZaloPay payment failed or cancelled for order ${orderId}:`, verifyResult.message);

            await handlePaymentFailure(orderId);

            return res.redirect(`${frontendUrl}/cancelled?orderId=${orderId}`);
        }
    } catch (error) {
        console.error("ZaloPay callback error:", error);
        const frontendUrl = process.env.FRONTEND_URL;
        return res.redirect(`${frontendUrl}/checkout?error=callback_error`);
    }
};

// export const vnpayCallback = async (req, res) => {
//     try {
//         const verifyResult = verifyReturnUrl(req.query);

//         if (!verifyResult.isVerified) {
//             console.error("VNPAY callback verification failed:", verifyResult);
//             const frontendUrl = process.env.FRONTEND_URL;
//             return res.redirect(`${frontendUrl}/checkout?error=verification_failed`);
//         }

//         const orderId = verifyResult.transactionRef ? Number(verifyResult.transactionRef) : null;
//         const frontendUrl = process.env.FRONTEND_URL;

//         if (!orderId) {
//             console.error("Cannot get orderId from VNPAY callback");
//             return res.redirect(`${frontendUrl}/checkout?error=invalid_order`);
//         }

//         if (verifyResult.isSuccess) {
//             console.log(`Payment success for order ${orderId}`);

//             const { success, error } = await completePayment(orderId, verifyResult.transactionRef);

//             if (success) {
//                 return res.redirect(`${frontendUrl}/thanks?orderId=${orderId}`);
//             } else {
//                 console.error(`Complete payment failed for order ${orderId}:`, error);
//                 return res.redirect(`${frontendUrl}/checkout?error=payment_processing_failed&orderId=${orderId}`);
//             }
//         } else {
//             console.log(`Payment failed for order ${orderId}:`, verifyResult.message);

//             await handlePaymentFailure(orderId);

//             return res.redirect(`${frontendUrl}/cancelled?orderId=${orderId}`);
//         }
//     } catch (error) {
//         console.error("VNPAY callback error:", error);
//         const frontendUrl = process.env.FRONTEND_URL;
//         return res.redirect(`${frontendUrl}/checkout?error=callback_error`);
//     }
// };

// export const vnpayNotify = async (req, res) => {
//     try {
//         const query = Object.keys(req.query).length ? req.query : req.body;
//         const verifyResult = verifyReturnUrl(query);

//         if (!verifyResult.isVerified) {
//             console.error('VNPAY notify verification failed:', verifyResult);
//             return res.status(400).send('Invalid signature');
//         }

//         const orderId = verifyResult.transactionRef ? Number(verifyResult.transactionRef) : null;
//         if (!orderId) return res.status(400).send('Invalid order');

//         if (verifyResult.isSuccess) {
//             await completePayment(orderId, verifyResult.transactionRef);
//         } else {
//             await handlePaymentFailure(orderId);
//         }

//         return res.status(200).send('OK');
//     } catch (error) {
//         console.error('VNPAY notify error:', error);
//         return res.status(500).send('ERROR');
//     }
// };

export const retryPayment = async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const newPaymentMethod = req.body?.paymentMethod;

    if (!user) {
        return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập" });
    }

    try {
        const { order, error } = await handleRetryPayment(id, user.id, newPaymentMethod);

        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        let paymentUrl = null;
        const backendUrl = process.env.BACKEND_URL;
        const paymentMethod = order.paymentMethod || "ZALOPAY";

        if (paymentMethod === "ZALOPAY") {
            const returnUrl = `${backendUrl}/api/carts/zalopay-callback`;

            paymentUrl = await createZaloPayPaymentUrl({
                amount: order.totalPrice,
                orderId: order.id,
                orderInfo: `Thanh toán lại đơn hàng #${order.id}`,
                returnUrl: returnUrl,
            });
        } else if (paymentMethod === "MOMO") {
            const returnUrl = `${backendUrl}/api/carts/momo-callback`;

            paymentUrl = await createMoMoPaymentUrl({
                amount: order.totalPrice,
                orderId: order.id,
                orderInfo: `Thanh toán lại đơn hàng #${order.id}`,
                returnUrl: returnUrl,
            });
        } else {
            // Đối với các phương thức thanh toán mock khác (VIETQR, SHOPEEPAY, CARD)
            const frontendUrl = process.env.FRONTEND_URL;
            await completePayment(order.id, `MOCK_${paymentMethod}_${Date.now()}`);
            paymentUrl = `${frontendUrl}/thanks?orderId=${order.id}`;
        }

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

export const zalopayIPN = async (req, res) => {
    try {
        const verifyResult = verifyZaloPayCallback(req.body);

        if (!verifyResult.isVerified) {
            console.error("ZaloPay IPN verification failed:", verifyResult.message);
            return res.status(400).json({
                return_code: 2,
                return_message: verifyResult.message || "mac mismatch",
            });
        }

        const orderId = verifyResult.orderId ? Number(verifyResult.orderId) : null;

        if (!orderId) {
            console.error("Cannot extract orderId from ZaloPay IPN data");
            return res.status(400).json({
                return_code: 2,
                return_message: "invalid order id",
            });
        }

        console.log(`ZaloPay IPN received for order ${orderId}, transaction: ${verifyResult.zpTransId}`);

        // Hoàn thành đơn hàng
        const { success, error } = await completePayment(orderId, String(verifyResult.zpTransId));

        if (success) {
            return res.status(200).json({
                return_code: 1,
                return_message: "success",
            });
        } else {
            console.error(`ZaloPay IPN: Complete payment failed for order ${orderId}:`, error);
            return res.status(500).json({
                return_code: 2,
                return_message: error || "payment completion failed",
            });
        }
    } catch (error) {
        console.error("ZaloPay IPN error:", error);
        return res.status(500).json({
            return_code: 2,
            return_message: error.message || "internal server error",
        });
    }
};

export const momoCallback = async (req, res) => {
    try {

        const { orderId: momoOrderId, resultCode, transId, message } = req.query;
        const frontendUrl = process.env.FRONTEND_URL;

        const parts = (momoOrderId || "").split("_");
        const orderId = parts.length > 1 ? Number(parts[1]) : null;

        if (!orderId) {
            console.error("Cannot get orderId from MoMo callback:", momoOrderId);
            return res.redirect(`${frontendUrl}/checkout?error=invalid_order`);
        }

        // resultCode=0 là thành công, khác 0 là thất bại/hủy
        if (Number(resultCode) === 0) {
            const { success, error } = await completePayment(orderId, transId || momoOrderId);

            if (success) {
                return res.redirect(`${frontendUrl}/thanks?orderId=${orderId}`);
            } else {
                console.error(`Complete payment failed for order ${orderId}:`, error);
                return res.redirect(`${frontendUrl}/checkout?error=payment_processing_failed&orderId=${orderId}`);
            }
        } else {
            console.log(`MoMo payment failed or cancelled for order ${orderId}: resultCode=${resultCode}, message=${message}`);

            await handlePaymentFailure(orderId);

            return res.redirect(`${frontendUrl}/cancelled?orderId=${orderId}`);
        }
    } catch (error) {
        console.error("MoMo callback error:", error);
        const frontendUrl = process.env.FRONTEND_URL;
        return res.redirect(`${frontendUrl}/checkout?error=callback_error`);
    }
};

export const momoIPN = async (req, res) => {
    try {
        const verifyResult = verifyMoMoSignature(req.body);

        if (!verifyResult.isVerified) {
            console.error("MoMo IPN verification failed:", verifyResult.message);
            return res.status(400).json({ success: false, message: verifyResult.message });
        }

        const orderId = verifyResult.orderId ? Number(verifyResult.orderId) : null;

        if (!orderId) {
            console.error("Cannot extract orderId from MoMo IPN data");
            return res.status(400).json({ success: false, message: "Invalid orderId" });
        }

        if (verifyResult.isSuccess) {
            console.log(`MoMo IPN received success for order ${orderId}, transaction: ${verifyResult.transactionRef}`);
            const { success, error } = await completePayment(orderId, verifyResult.transactionRef);

            if (!success) {
                console.error(`MoMo IPN: Complete payment failed for order ${orderId}:`, error);
                return res.status(500).json({ success: false, message: error });
            }
        } else {
            console.log(`MoMo IPN received failure for order ${orderId}:`, verifyResult.message);
            await handlePaymentFailure(orderId);
        }

        return res.status(200).json({ success: true, message: "Success" });
    } catch (error) {
        console.error("MoMo IPN error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};