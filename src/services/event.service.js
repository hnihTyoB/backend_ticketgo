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
        where: { id: Number(id) }
    });
};

export const createEvent = async (title, description, category, location, startDate, duration, organizer, bannerUrl) => {
    return await prisma.event.create({
        data: {
            title, description, category, location, startDate, duration, organizer, bannerUrl
        },
    });
};

export const updateEvent = async (id, title, description, category, location, startDate, duration, organizer, bannerUrl) => {
    const dataToUpdate = {
        title, description, category, location, startDate, duration, organizer, bannerUrl
    };

    return await prisma.event.update({
        where: { id: Number(id) },
        data: dataToUpdate,
    });
};

export const removeEvent = async (id) => {
    return await prisma.event.delete({
        where: { id: Number(id) },
    });
};
