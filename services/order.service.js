import { prisma } from "../config/client.js";
import { TOTAL_ITEM_PER_PAGE } from "../config/constant.js";

export const findAllOrders = async (page) => {
    const pageSize = TOTAL_ITEM_PER_PAGE;
    const skip = (page - 1) * pageSize;
    const orders = await prisma.order.findMany({
        skip: skip,
        take: pageSize,
        include: {
            user: true,
        }
    });
    return orders;
};

export const countTotalOrderPages = async () => {
    const totalItems = await prisma.order.count();
    const pageSize = TOTAL_ITEM_PER_PAGE;
    const totalPages = Math.ceil(totalItems / pageSize);
    return totalPages;
}


export const findOrderById = async (id) => {
    return await prisma.orderDetail.findMany({
        where: {
            orderId: parseInt(id)
        },
        include: {
            product: true,
        }
    })
};