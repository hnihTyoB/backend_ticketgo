import { prisma } from "../config/client.js";

const getWeekRange = () => {
    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);

    const currentDay = now.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;

    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
};

const getMonthRange = () => {
    const now = new Date();

    const startOfMonth = new Date(now);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return { startOfMonth, endOfMonth };
};

export const findAllEventsWithFilter = async (page, limit, search, category, week, month, from, to, sort) => {
    const skip = (page - 1) * limit;

    let whereCondition = {};

    if (search) {
        whereCondition.title = {
            contains: search
        };
    }

    if (week) {
        const { startOfWeek, endOfWeek } = getWeekRange();
        whereCondition.startDate = {
            gte: startOfWeek,
            lte: endOfWeek
        };
    }

    if (month) {
        const { startOfMonth, endOfMonth } = getMonthRange();
        whereCondition.startDate = {
            gte: startOfMonth,
            lte: endOfMonth
        };
    }

    if (category) {
        whereCondition.category = category;
    }

    if (from && to) {
        const startDate = new Date(from);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        whereCondition.startDate = {
            ...whereCondition.startDate,
            gte: startDate,
            lte: endDate,
        };
    }

    const events = await prisma.event.findMany({
        skip: skip,
        take: limit,
        where: whereCondition,
        include: {
            ticketTypes: true
        },
        orderBy: {
            startDate: sort
        }
    });

    return events;
};

export const countTotalEventPagesWithFilter = async (limit, search, category, week, month, from, to) => {
    let whereCondition = {};

    if (search) {
        whereCondition.title = {
            contains: search
        };
    }

    if (week) {
        const { startOfWeek, endOfWeek } = getWeekRange();
        whereCondition.startDate = {
            gte: startOfWeek,
            lte: endOfWeek
        };
    }

    if (month) {
        const { startOfMonth, endOfMonth } = getMonthRange();
        whereCondition.startDate = {
            gte: startOfMonth,
            lte: endOfMonth
        };
    }

    if (category) {
        whereCondition.category = category;
    }

    if (from && to) {
        const startDate = new Date(from);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        whereCondition.startDate = {
            ...whereCondition.startDate,
            gte: startDate,
            lte: endDate,
        };
    }

    const totalItems = await prisma.event.count({
        where: whereCondition
    });

    const totalPages = Math.ceil(totalItems / limit);
    return totalPages;
};