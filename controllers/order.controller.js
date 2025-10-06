import { countTotalOrderPages, findAllOrders, findOrderById, modifyStatus } from "../services/order.service.js";

export const getAllOrders = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    try {
        const orders = await findAllOrders(page);
        const totalPages = await countTotalOrderPages();
        res.json({ orders, totalPages });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const id = req.params.id;
        const orderDetails = await findOrderById(id);
        if (!orderDetails) return res.status(404).json({ error: "Order not found" });
        res.json({ orderDetails, id });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const orderStatus = await modifyStatus(id, status);
        if (!orderStatus) return res.status(404).json({ error: "Order status not found" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};