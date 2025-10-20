import { prisma } from "../config/client.js";

export const getTicketTypes = async (eventId) => {
    const ticketTypes = await prisma.ticketType.findMany({
        where: {
            eventId: Number(eventId)
        },
        orderBy: {
            id: 'desc'
        }
    });

    return ticketTypes;
};

export const createTicketType = async (eventId, ticketData) => {
    const { type, price, quantity, description } = ticketData;

    const ticketType = await prisma.ticketType.create({
        data: {
            type,
            price: Number(price),
            quantity: Number(quantity),
            description,
            sold: 0,
            eventId: Number(eventId)
        },
        include: {
            event: true
        }
    });

    return ticketType;
};

export const updateTicketType = async (id, updateData) => {
    const { type, price, quantity, description } = updateData;

    const ticketType = await prisma.ticketType.update({
        where: {
            id: Number(id)
        },
        data: {
            type,
            price: Number(price),
            quantity: Number(quantity),
            description
        },
        include: {
            event: true
        }
    });

    return ticketType;
};

export const deleteTicketType = async (id) => {
    const cartDetails = await prisma.ticketCartDetail.findFirst({
        where: {
            ticketTypeId: Number(id)
        }
    });

    const orderDetails = await prisma.ticketOrderDetail.findFirst({
        where: {
            ticketTypeId: Number(id)
        }
    });

    if (cartDetails || orderDetails) {
        throw new Error("Không thể xóa loại vé đang được sử dụng trong giỏ hàng hoặc đơn hàng");
    }

    const ticketType = await prisma.ticketType.delete({
        where: {
            id: Number(id)
        }
    });

    return ticketType;
};

export const updateTicketSold = async (id, soldQuantity) => {
    const ticketType = await prisma.ticketType.update({
        where: {
            id: Number(id)
        },
        data: {
            sold: soldQuantity
        }
    });

    return ticketType;
};
