import { TOTAL_ITEM_PER_PAGE } from "../config/constant.js";
import {
    countTotalOrderPages,
    findAllOrders,
    findOrderById,
    updateStatus
} from "../services/order.service.js";

export const getAllOrders = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || TOTAL_ITEM_PER_PAGE;

    try {
        const orders = await findAllOrders(page, limit);
        const totalPages = await countTotalOrderPages(limit);

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

    try {
        const orderDetails = await findOrderById(orderId);
        if (!orderDetails) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
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
            message: "Lỗi server khi cập nhật trạng thái đơn hàng",
            error: err.message,
        });
    }
};
