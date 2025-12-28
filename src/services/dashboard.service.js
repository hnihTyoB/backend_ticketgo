import { prisma } from "../config/client.js";
import { STATUS_ORDERS } from "../config/constant.js";

export const countDashboard = async () => {
    const countUser = await prisma.user.count();
    const countEvent = await prisma.event.count();
    const countOrder = await prisma.ticketOrder.count();
    const totalRevenueResult = await prisma.ticketOrder.aggregate({
        _sum: {
            totalPrice: true,
        },
        where: {
            status: STATUS_ORDERS.COMPLETED,
        },
    });
    const totalRevenue = totalRevenueResult._sum.totalPrice || 0;
    return {
        countUser,
        countEvent,
        countOrder,
        totalRevenue,
    }
}

const getStartDate = (filter) => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    switch (filter) {
        case 'today': {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            return { gte: todayStart, lte: now };
        }
        case '7days': {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);
            return { gte: sevenDaysAgo, lte: now };
        }
        case '30days': {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 29);
            thirtyDaysAgo.setHours(0, 0, 0, 0);
            return { gte: thirtyDaysAgo, lte: now };
        }
        default: {
            const defaultDaysAgo = new Date();
            defaultDaysAgo.setDate(now.getDate() - 6);
            defaultDaysAgo.setHours(0, 0, 0, 0);
            return { gte: defaultDaysAgo, lte: now };
        }
    }
};

export const getDashboardCharts = async (filter = '7days') => {
    const dateRange = getStartDate(filter);

    // 1. Tông doanh thu và số vé bán được theo ngày/giờ
    const orders = await prisma.ticketOrder.findMany({
        where: {
            status: 'COMPLETED',
            createdAt: dateRange,
        },
        include: {
            ticketOrderDetails: true,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    const salesByDate = {};

    orders.forEach(order => {
        const date = filter === 'today'
            ? order.createdAt.getHours().toString().padStart(2, '0') + ':00'
            : order.createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

        if (!salesByDate[date]) {
            salesByDate[date] = { date, revenue: 0, tickets: 0 };
        }

        salesByDate[date].revenue += order.totalPrice;
        salesByDate[date].tickets += order.ticketOrderDetails.reduce((sum, detail) => sum + detail.quantity, 0);
    });

    const revenueData = Object.values(salesByDate).map(({ date, revenue }) => ({ date, revenue }));
    const ticketSalesData = Object.values(salesByDate).map(({ date, tickets }) => ({ date, tickets }));

    // 2. Dữ liệu sự kiện phổ biến (Top 5)
    const popularEvents = await prisma.ticketOrderDetail.groupBy({
        by: ['ticketTypeId'],
        where: {
            order: {
                status: 'COMPLETED',
                createdAt: dateRange,
            },
        },
        _sum: {
            quantity: true,
            price: true, // Lưu ý: Trường price được tổng hợp, để tính doanh thu cần price*quantity
        },
        orderBy: {
            _sum: {
                quantity: 'desc',
            },
        },
        take: 5,
    });

    const popularEventsDetails = await Promise.all(
        popularEvents.map(async (item) => {
            const ticketType = await prisma.ticketType.findUnique({
                where: { id: item.ticketTypeId },
                include: { event: true },
            });
            return {
                event: ticketType.event.title,
                tickets: item._sum.quantity,
                revenue: item._sum.quantity * ticketType.price,
            };
        })
    );

    // 3. Dữ liệu loại vé bán chạy
    const ticketTypesSold = await prisma.ticketOrderDetail.groupBy({
        by: ['ticketTypeId'],
        where: {
            order: {
                status: 'COMPLETED',
                createdAt: dateRange,
            },
        },
        _sum: {
            quantity: true,
        },
    });

    const ticketTypeDetails = await Promise.all(
        ticketTypesSold.map(async (item) => {
            const ticketType = await prisma.ticketType.findUnique({
                where: { id: item.ticketTypeId },
            });
            return {
                type: ticketType.type,
                sold: item._sum.quantity,
                revenue: item._sum.quantity * ticketType.price,
            };
        })
    );

    return { revenueData, ticketSalesData, popularEventsData: popularEventsDetails, ticketTypeData: ticketTypeDetails };
};