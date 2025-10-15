import { countDashboard } from "../services/dashboard.service.js";

export const getDashboard = async (req, res) => {
    try {
        const info = await countDashboard();
        res.json({ info });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};  