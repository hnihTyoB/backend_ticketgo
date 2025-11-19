import { prisma } from "../config/client.js";

export const addToCart = async (ticketTypeId, quantity, userId) => {
    const ticketType = await prisma.ticketType.findUnique({
        where: { id: Number(ticketTypeId) },
        include: { event: true },
    });

    if (!ticketType) throw new Error("Loại vé không tồn tại.");

    if (new Date(ticketType.event.startDate) <= new Date()) {
        throw new Error("Không thể mua vé của sự kiện đã diễn ra.");
    }

    const availableQuantity = ticketType.quantity - (ticketType.sold || 0);
    if (availableQuantity < quantity) {
        throw new Error(`Số lượng vé còn lại không đủ. Chỉ còn ${availableQuantity} vé.`);
    }

    let cart = await prisma.ticketCart.findUnique({
        where: { userId: Number(userId) },
    });

    if (!cart) {
        cart = await prisma.ticketCart.create({
            data: {
                userId: Number(userId),
                sum: Number(quantity),
            },
        });
    } else {
        await prisma.ticketCart.update({
            where: { id: cart.id },
            data: { sum: { increment: Number(quantity) } },
        });
    }

    const existingItem = await prisma.ticketCartDetail.findFirst({
        where: {
            ticketTypeId: Number(ticketTypeId),
            cartId: cart.id,
        },
    });

    if (existingItem) {
        await prisma.ticketCartDetail.update({
            where: { id: existingItem.id },
            data: { quantity: { increment: Number(quantity) } },
        });
    } else {
        await prisma.ticketCartDetail.create({
            data: {
                quantity: Number(quantity),
                price: ticketType.price,
                cartId: cart.id,
                ticketTypeId: Number(ticketTypeId),
            },
        });
    }
};

export const ticketTypeInCart = async (userId, page, limit) => {
    const skip = (page - 1) * limit;

    // Find the user's cart first
    const cart = await prisma.ticketCart.findUnique({
        where: { userId: Number(userId) },
    });

    if (!cart) {
        return [];
    }

    // Fetch cart details (apply pagination on details)
    const details = await prisma.ticketCartDetail.findMany({
        where: { cartId: cart.id },
        // skip,
        // take: limit,
        include: {
            ticketType: {
                include: { event: true },
            },
        },
    });

    if (!details.length) return [];

    // Kiểm tra và cập nhật giá nếu có thay đổi
    const updatedDetails = await Promise.all(
        details.map(async (item) => {
            const currentTicketType = await prisma.ticketType.findUnique({
                where: { id: item.ticketTypeId },
            });

            // Nếu giá thay đổi, cập nhật lại
            if (currentTicketType && currentTicketType.price !== item.price) {
                await prisma.ticketCartDetail.update({
                    where: { id: item.id },
                    data: { price: currentTicketType.price },
                });
                // return updated shape so frontend sees new price
                return { ...item, price: currentTicketType.price, ticketType: { ...item.ticketType, price: currentTicketType.price } };
            }
            return item;
        })
    );

    return updatedDetails;
};

export const countTotalCartPages = async (userId, limit) => {
    const cart = await prisma.ticketCart.findUnique({
        where: { userId: Number(userId) },
    });

    if (!cart) return 0;

    const totalItems = await prisma.ticketCartDetail.count({
        where: { cartId: cart.id },
    });

    const totalPages = Math.ceil(totalItems / limit);
    return totalPages;
};

export const removeFromCart = async (cartDetailId, userId) => {
    const cartDetail = await prisma.ticketCartDetail.findFirst({
        where: {
            id: Number(cartDetailId),
            cart: { userId },
        },
    });

    if (!cartDetail) throw new Error("Không tìm thấy vé trong giỏ hoặc bạn không có quyền xóa.");

    await prisma.ticketCartDetail.delete({ where: { id: cartDetail.id } });

    await prisma.ticketCart.update({
        where: { id: cartDetail.cartId },
        data: {
            sum: { decrement: cartDetail.quantity },
        },
    });
};

export const clearCart = async (userId) => {
    const cart = await prisma.ticketCart.findUnique({
        where: { userId: Number(userId) },
        include: { ticketCartDetails: true }
    });

    if (!cart) {
        throw new Error("Giỏ hàng không tồn tại.");
    }

    await prisma.$transaction(async (tx) => {
        await tx.ticketCartDetail.deleteMany({
            where: { cartId: cart.id }
        });

        await tx.ticketCart.delete({
            where: { id: cart.id }
        });
    });
};

export const updateCartItemQuantity = async (cartDetailId, newQuantity, userId) => {
    const cartDetail = await prisma.ticketCartDetail.findFirst({
        where: {
            id: Number(cartDetailId),
            cart: { userId },
        },
    });

    if (!cartDetail) throw new Error("Vé không có trong giỏ hàng.");

    if (newQuantity <= 0) {
        await removeFromCart(cartDetailId, userId);
    } else {
        await prisma.ticketCartDetail.update({
            where: { id: cartDetail.id },
            data: { quantity: newQuantity },
        });

        const cartDetails = await prisma.ticketCartDetail.findMany({
            where: { cartId: cartDetail.cartId },
        });

        const newSum = cartDetails.reduce((acc, i) => acc + i.quantity, 0);

        await prisma.ticketCart.update({
            where: { id: cartDetail.cartId },
            data: { sum: newSum },
        });
    }
};

export const prepareCartBeforeCheckout = async (currentCartDetails, cartId) => {
    if (!Array.isArray(currentCartDetails) || !cartId) {
        throw new Error("Dữ liệu không hợp lệ");
    }

    if (currentCartDetails.length === 0) {
        throw new Error("Giỏ hàng trống. Vui lòng thêm vé vào giỏ hàng.");
    }

    await prisma.$transaction(async (tx) => {
        let totalQuantity = 0;

        await Promise.all(
            currentCartDetails.map(async (item) => {
                const id = Number(item.id);
                const qty = Number(item.quantity);

                if (isNaN(id) || isNaN(qty) || qty <= 0) {
                    throw new Error(`Số lượng không hợp lệ cho item ID: ${item.id}`);
                }

                totalQuantity += qty;

                await tx.ticketCartDetail.update({
                    where: { id },
                    data: { quantity: qty },
                });
            })
        );

        await tx.ticketCart.update({
            where: { id: Number(cartId) },
            data: { sum: totalQuantity },
        });
    });
};

export const handlePlaceOrder = async (
    userId,
    receiverName,
    receiverPhone,
    receiverEmail,
    totalPrice,
    paymentMethod
) => {
    try {
        const order = await prisma.$transaction(async (tx) => {
            const cart = await tx.ticketCart.findUnique({
                where: { userId: Number(userId) },
                include: {
                    ticketCartDetails: {
                        include: {
                            ticketType: {
                                include: { event: true }
                            }
                        }
                    }
                },
            });

            if (!cart || !cart.ticketCartDetails.length) {
                throw new Error("Giỏ hàng trống hoặc không tồn tại.");
            }

            // Tính tổng giá từ cart
            const calculatedTotalPrice = cart.ticketCartDetails.reduce(
                (sum, item) => sum + (item.price * item.quantity),
                0
            );

            // Validate totalPrice phải khớp với giá trong giỏ
            if (Math.abs(calculatedTotalPrice - Number(totalPrice)) > 1) {
                throw new Error("Tổng giá không khớp với giỏ hàng. Vui lòng làm mới trang.");
            }

            for (const item of cart.ticketCartDetails) {
                const type = item.ticketType;

                if (new Date(type.event.startDate) <= new Date()) {
                    throw new Error(`Sự kiện "${type.event.title}" đã diễn ra.`);
                }

                const availableQuantity = type.quantity - (type.sold || 0);
                if (availableQuantity < item.quantity) {
                    throw new Error(`Loại vé "${type.type}" không đủ số lượng! Chỉ còn ${availableQuantity} vé.`);
                }

                if (type.price !== item.price) {
                    throw new Error(`Giá vé "${type.type}" đã thay đổi. Vui lòng cập nhật giỏ hàng.`);
                }
            }

            // Tạo order tạm thời (chưa trừ vé, chưa xóa cart) - chờ thanh toán thành công
            const order = await tx.ticketOrder.create({
                data: {
                    totalPrice: Number(totalPrice),
                    receiverName,
                    receiverPhone,
                    receiverEmail,
                    status: "PENDING",
                    paymentMethod: paymentMethod,
                    paymentStatus: "PAYMENT_UNPAID",
                    userId: Number(userId),
                    ticketOrderDetails: {
                        create: cart.ticketCartDetails.map((item) => ({
                            price: item.price,
                            quantity: item.quantity,
                            ticketTypeId: item.ticketTypeId,
                        })),
                    },
                },
            });

            return order;
        });

        return { orderId: order.id, error: null };
    } catch (error) {
        console.error("HandlePlaceOrder error:", error);
        return { orderId: null, error: error.message };
    }
};

export const completePayment = async (orderId, transactionRef) => {
    try {
        await prisma.$transaction(async (tx) => {
            const order = await tx.ticketOrder.findUnique({
                where: { id: Number(orderId) },
                include: {
                    ticketOrderDetails: {
                        include: {
                            ticketType: true
                        }
                    },
                    user: {
                        include: {
                            TicketCart: {
                                include: {
                                    ticketCartDetails: true
                                }
                            }
                        }
                    }
                },
            });

            if (!order) {
                throw new Error("Không tìm thấy đơn hàng.");
            }

            // Kiểm tra đơn hàng đã thanh toán chưa
            if (order.paymentStatus === "PAYMENT_SUCCESS") {
                console.log(`Order ${orderId} đã được thanh toán trước đó.`);
                return;
            }

            // Validate lại số lượng vé còn đủ không
            for (const detail of order.ticketOrderDetails) {
                const ticketType = detail.ticketType;
                const availableQuantity = ticketType.quantity - (ticketType.sold || 0);

                if (availableQuantity < detail.quantity) {
                    throw new Error(`Loại vé "${ticketType.type}" không đủ số lượng! Chỉ còn ${availableQuantity} vé.`);
                }
            }

            // Cập nhật số lượng và số lượng đã bán cho từng loại vé
            for (const detail of order.ticketOrderDetails) {
                await tx.ticketType.update({
                    where: { id: detail.ticketTypeId },
                    data: {
                        quantity: { decrement: detail.quantity },
                        sold: { increment: detail.quantity },
                    },
                });
            }

            // Cập nhật order: thanh toán thành công
            await tx.ticketOrder.update({
                where: { id: Number(orderId) },
                data: {
                    status: "COMPLETED",
                    paymentStatus: "PAYMENT_SUCCESS",
                    paymentRef: transactionRef || null,
                },
            });

            // Xóa cart và cart details
            if (order.user.TicketCart) {
                await tx.ticketCartDetail.deleteMany({
                    where: { cartId: order.user.TicketCart.id }
                });
                await tx.ticketCart.delete({
                    where: { id: order.user.TicketCart.id }
                });
            }
        });

        return { success: true, error: null };
    } catch (error) {
        console.error("CompletePayment error:", error);
        return { success: false, error: error.message };
    }
};

export const handlePaymentFailure = async (orderId) => {
    try {
        await prisma.ticketOrder.update({
            where: { id: Number(orderId) },
            data: {
                paymentStatus: "PAYMENT_FAILED",
                status: "CANCELLED",
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error("HandlePaymentFailure error:", error);
        return { success: false, error: error.message };
    }
};

export const calculateCartTotal = (cartDetails) => {
    if (!Array.isArray(cartDetails) || cartDetails.length === 0) {
        return 0;
    }
    return cartDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};
