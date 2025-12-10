import { countDashboard, getDashboardCharts } from "../services/dashboard.service.js";

export const getDashboard = async (req, res) => {
    try {
        const info = await countDashboard();
        res.status(200).json({ success: true, info });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

export const getCharts = async (req, res) => {
    try {
        const { filter } = req.query;
        const chartData = await getDashboardCharts(filter);
        res.status(200).json({ success: true, chartData });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};