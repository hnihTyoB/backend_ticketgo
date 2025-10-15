import { prisma } from "../config/client.js";
import { STATUS_ORDERS } from "../config/constant.js";

export const countDashboard = async () => {
    const countUser = await prisma.user.count();
    const countEvent = await prisma.event.count();
    const countOrder = await prisma.order.count();
    const totalRevenueResult = await prisma.order.aggregate({
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