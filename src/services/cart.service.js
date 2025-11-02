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

export const ticketTypeInCart = async (userId) => {
    const cart = await prisma.ticketCart.findUnique({
        where: { userId: Number(userId) },
        include: {
            ticketCartDetails: {
                include: {
                    ticketType: {
                        include: { event: true },
                    },
                },
            },
        },
    });

    if (!cart || !cart.ticketCartDetails.length) {
        return [];
    }

    // Kiểm tra và cập nhật giá nếu có thay đổi
    const updatedDetails = await Promise.all(
        cart.ticketCartDetails.map(async (detail) => {
            const currentTicketType = await prisma.ticketType.findUnique({
                where: { id: detail.ticketTypeId },
            });

            // Nếu giá thay đổi, cập nhật lại
            if (currentTicketType && currentTicketType.price !== detail.price) {
                await prisma.ticketCartDetail.update({
                    where: { id: detail.id },
                    data: { price: currentTicketType.price },
                });
                return { ...detail, price: currentTicketType.price };
            }
            return detail;
        })
    );

    return updatedDetails;
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
    paymentMethod = "VNPAY"
) => {
    try {
        await prisma.$transaction(async (tx) => {
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

            await tx.ticketOrder.create({
                data: {
                    totalPrice: Number(totalPrice),
                    receiverName,
                    receiverPhone,
                    receiverEmail,
                    status: "PENDING",
                    paymentMethod,
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

            // Cập nhật số lượng và số lượng đã bán cho từng loại vé
            for (const item of cart.ticketCartDetails) {
                await tx.ticketType.update({
                    where: { id: item.ticketTypeId },
                    data: {
                        quantity: { decrement: item.quantity },
                        sold: { increment: item.quantity },
                    },
                });
            }

            await tx.ticketCartDetail.deleteMany({ where: { cartId: cart.id } });
            await tx.ticketCart.delete({ where: { id: cart.id } });
        });

        return "";
    } catch (error) {
        console.error("HandlePlaceOrder error:", error);
        return error.message;
    }
};

export const countTotalOrderPages = async (limit) => {
    const totalItems = await prisma.ticketOrder.count();
    return Math.ceil(totalItems / limit);
}

export const orderHistory = async (userId, page, limit) => {
    const skip = (page - 1) * limit;

    const orders = await prisma.ticketOrder.findMany({
        where: { userId: Number(userId) },
        include: {
            ticketOrderDetails: {
                include: {
                    ticketType: { include: { event: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
    });
    return orders;
};

export const calculateCartTotal = (cartDetails) => {
    if (!Array.isArray(cartDetails) || cartDetails.length === 0) {
        return 0;
    }
    return cartDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};
