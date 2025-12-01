import { TOTAL_ITEM_PER_PAGE } from "../config/constant.js";
import {
    countAllOrderPages, getPendingTicketsTotalQuantity,
    findAllOrders,
    findOrderById,
    findOrderHistoryByUser,
    updateStatus,
    countTotalOrderHistoryPages
} from "../services/order.service.js";

export const getAllOrders = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || TOTAL_ITEM_PER_PAGE;

    try {
        const orders = await findAllOrders(page, limit);
        const totalPages = await countAllOrderPages(limit);

        return res.status(200).json({
            success: true,
            orders,
            totalPages,
            page,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách đơn hàng",
            error: err.message,
        });
    }
};

export const getOrderById = async (req, res) => {
    const orderId = parseInt(req.params.id);
    const user = req.user;

    try {
        const orderDetails = await findOrderById(orderId);
        if (!orderDetails) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        if (user && user.role?.name !== "ADMIN" && orderDetails.userId !== user.id) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền xem đơn hàng này"
            });
        }

        return res.status(200).json({
            success: true,
            orderId,
            orderDetails,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy chi tiết đơn hàng",
            error: err.message,
        });
    }
};

export const getOrderHistory = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
        });
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || TOTAL_ITEM_PER_PAGE;

        const status = req.query.status || "COMPLETED";
        const eventTime = req.query.eventTime || "UPCOMING";
        const [orders, { totalPages, totalItems }] = await Promise.all([
            findOrderHistoryByUser(user.id, page, limit, status, eventTime),
            countTotalOrderHistoryPages(user.id, limit, status, eventTime),
        ]);
        return res.status(200).json({ success: true, orders, totalPages, totalItems });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Lỗi server khi lấy vé đã mua", error: err.message });
    }
};

export const getPendingTicketsCount = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập",
        });
    }

    try {
        const totalTickets = await getPendingTicketsTotalQuantity(user.id);
        return res.status(200).json({ success: true, totalTickets });
    } catch (err) {
        console.error("GetPendingTicketsCount error:", err);
        return res.status(500).json({ success: false, message: "Lỗi server khi lấy số lượng vé đang xử lý", error: err.message });
    }
};

export const putUpdateStatus = async (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    try {
        const updatedOrder = await updateStatus(orderId, status);
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái thành công",
            newStatus: updatedOrder.status,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật trạng thái vé đã mua",
            error: err.message,
        });
    }
};
