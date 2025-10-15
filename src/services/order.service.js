import { prisma } from "../config/client.js";

export const findAllOrders = async (page, limit) => {
    const skip = (page - 1) * limit;

    const orders = await prisma.ticketOrder.findMany({
        skip,
        take: limit,
        include: {
            user: true,
            ticketOrderDetails: {
                include: {
                    ticketType: {
                        include: {
                            event: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return orders;
};

export const countTotalOrderPages = async (limit) => {
    const totalItems = await prisma.ticketOrder.count();
    const totalPages = Math.ceil(totalItems / limit);
    return totalPages;
};

export const findOrderById = async (id) => {
    return await prisma.ticketOrder.findUnique({
        where: { id: Number(id) },
        include: {
            user: true,
            ticketOrderDetails: {
                include: {
                    ticketType: {
                        include: {
                            event: true,
                        },
                    },
                },
            },
        },
    });
};

export const updateStatus = async (id, status) => {
    return await prisma.ticketOrder.update({
        where: { id: Number(id) },
        data: { status },
    });
};
