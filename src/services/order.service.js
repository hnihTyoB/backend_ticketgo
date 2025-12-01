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

export const countAllOrderPages = async (limit) => {
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

export const findOrderHistoryByUser = async (userId, page, limit, status = null, eventTime = "UPCOMING") => {
    const skip = (page - 1) * limit;

    const whereCondition = {
        userId: Number(userId)
    };

    if (status && status !== 'ALL') {
        whereCondition.status = status;
    }

    if (eventTime) {
        const now = new Date();
        if (eventTime === 'UPCOMING') {
            whereCondition.ticketOrderDetails = {
                some: {
                    ticketType: {
                        event: {
                            startDate: { gt: now }
                        }
                    }
                }
            };
        } else if (eventTime === 'PAST') {
            whereCondition.ticketOrderDetails = {
                some: {
                    ticketType: {
                        event: {
                            startDate: { lte: now }
                        }
                    }
                }
            };
        }
    }

    return await prisma.ticketOrder.findMany({
        skip: skip,
        take: limit,
        where: whereCondition,
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
};

export const getPendingTicketsTotalQuantity = async (userId) => {
    const pendingOrders = await prisma.ticketOrder.findMany({
        where: {
            userId: Number(userId),
            status: 'PENDING',
        },
        include: {
            ticketOrderDetails: {
                select: { quantity: true }
            }
        }
    });

    let totalTickets = 0;
    for (const order of pendingOrders) {
        for (const detail of order.ticketOrderDetails) {
            totalTickets += detail.quantity;
        }
    }
    return totalTickets;
};

export const countTotalOrderHistoryPages = async (userId, limit, status = null, eventTime = "UPCOMING") => {
    const whereCondition = {
        userId: Number(userId)
    };

    if (status && status !== 'ALL') {
        whereCondition.status = status;
    }

    if (eventTime) {
        const now = new Date();
        if (eventTime === 'UPCOMING') {
            whereCondition.ticketOrderDetails = {
                some: {
                    ticketType: {
                        event: {
                            startDate: { gt: now }
                        }
                    }
                }
            };
        } else if (eventTime === 'PAST') {
            whereCondition.ticketOrderDetails = {
                some: {
                    ticketType: {
                        event: {
                            startDate: { lte: now }
                        }
                    }
                }
            };
        }
    }

    const totalItems = await prisma.ticketOrder.count({
        where: whereCondition,
    });

    const totalPages = Math.ceil(totalItems / limit);
    return { totalPages, totalItems };
};

export const updateStatus = async (id, status) => {
    return await prisma.ticketOrder.update({
        where: { id: Number(id) },
        data: { status },
    });
};
