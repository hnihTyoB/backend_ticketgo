import { prisma } from "../config/client.js";

export const findAllEvents = async (page, limit, sort) => {
    const skip = (page - 1) * limit;
    const events = await prisma.event.findMany({
        skip: skip,
        take: limit,
        include: {
            ticketTypes: true
        },
        orderBy: {
            startDate: sort
        },
    });
    return events;
};

export const countTotalEventPages = async (limit) => {
    const totalItems = await prisma.event.count();
    const totalPages = Math.ceil(totalItems / limit);
    return totalPages;
}

export const findEventById = async (id) => {
    return await prisma.event.findUnique({
        where: { id: Number(id) },
        include: {
            ticketTypes: true
        }
    });
};

export const createEvent = async (data) => {
    return await prisma.event.create({
        data: data
    });
};

export const updateEvent = async (id, data) => {
    return await prisma.event.update({
        where: { id: Number(id) },
        data: data,
    });
};

export const removeEvent = async (id) => {
    const eventId = Number(id);

    const ticketTypes = await prisma.ticketType.findMany({
        where: { eventId: eventId },
        select: { id: true }
    });

    const ticketTypeIds = ticketTypes.map(t => t.id);

    if (ticketTypeIds.length > 0) {
        const orderDetail = await prisma.ticketOrderDetail.findFirst({
            where: { ticketTypeId: { in: ticketTypeIds } }
        });
        if (orderDetail) {
            throw new Error("Không thể xóa sự kiện vì đã có vé được bán trong đơn hàng.");
        }

        const cartDetail = await prisma.ticketCartDetail.findFirst({
            where: { ticketTypeId: { in: ticketTypeIds } }
        });
        if (cartDetail) {
            throw new Error("Không thể xóa sự kiện vì đang có vé trong giỏ hàng của người dùng.");
        }
    }

    await prisma.ticketType.deleteMany({
        where: { eventId: eventId }
    });

    return await prisma.event.delete({
        where: { id: eventId }
    });
};
