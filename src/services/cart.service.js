import { prisma } from "../config/client.js";

export const addToCart = async (ticketTypeId, quantity, user) => {
    const ticketType = await prisma.ticketType.findUnique({
        where: { id: Number(ticketTypeId) },
        include: { event: true },
    });

    if (!ticketType) throw new Error("Loại vé không tồn tại.");

    let cart = await prisma.ticketCart.findUnique({
        where: { userId: user.id },
    });

    if (!cart) {
        cart = await prisma.ticketCart.create({
            data: {
                userId: user.id,
                sum: quantity,
            },
        });
    } else {
        await prisma.ticketCart.update({
            where: { id: cart.id },
            data: { sum: { increment: quantity } },
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
            data: { quantity: { increment: quantity } },
        });
    } else {
        await prisma.ticketCartDetail.create({
            data: {
                quantity,
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

    return cart ? cart.ticketCartDetails : [];
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
        throw new Error("Invalid input data");
    }

    await prisma.$transaction(async (tx) => {
        let totalQuantity = 0;

        await Promise.all(
            currentCartDetails.map(async (item) => {
                const id = Number(item.id);
                const qty = Number(item.quantity);

                if (isNaN(id) || isNaN(qty)) return;

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
                include: { ticketCartDetails: true },
            });

            if (!cart || !cart.ticketCartDetails.length) {
                throw new Error("Giỏ hàng trống hoặc không tồn tại.");
            }

            for (const item of cart.ticketCartDetails) {
                const type = await tx.ticketType.findUnique({ where: { id: item.ticketTypeId } });
                if (!type || type.quantity < item.quantity) {
                    throw new Error(`Loại vé "${type?.type ?? "Không xác định"}" không đủ số lượng!`);
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

export const orderHistory = async (userId) => {
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
    });
    return orders;
};
