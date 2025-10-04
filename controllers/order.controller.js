import { countTotalOrderPages, findAllOrders, findOrderById } from "../services/order.service";

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