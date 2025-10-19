import { prisma } from "../config/client.js";

export const findAllEvents = async (page, limit) => {
    const skip = (page - 1) * limit;
    const events = await prisma.event.findMany({
        skip: skip,
        take: limit,
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
    await prisma.ticketType.deleteMany({
        where: { eventId: Number(id) }
    });

    return await prisma.event.delete({
        where: { id: Number(id) }
    });
};
