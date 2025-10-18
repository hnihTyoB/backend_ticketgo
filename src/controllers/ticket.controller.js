import {
    createTicketType,
    getTicketTypes,
    updateTicketType,
    deleteTicketType,
    updateTicketSold
} from "../services/ticket.service.js";
import { ticketTypeSchema } from "../validation/ticket.schema.js";

export const getTicketTypesByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const ticketTypes = await getTicketTypes(eventId);

        res.status(200).json({
            ticketTypes
        });
    } catch (err) {
        console.error("Lỗi khi lấy danh sách loại vé:", err);
        res.status(500).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};

export const postCreateTicketTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const ticketData = {
            ...req.body,
            eventId: Number(id)
        };

        const validate = ticketTypeSchema.safeParse(ticketData);
        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => ({
                    path: err.path[0],
                    message: err.message
                }))
            });
        }

        const ticketType = await createTicketType(id, validate.data);

        res.status(201).json({
            message: "Tạo loại vé thành công",
            ticketType
        });
    } catch (err) {
        console.error("Lỗi khi tạo loại vé:", err);
        res.status(500).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};

export const putUpdateTicketTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const ticketData = {
            ...req.body,
            eventId: Number(id)
        };

        const validate = ticketTypeSchema.safeParse(ticketData);
        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => ({
                    path: err.path[0],
                    message: err.message
                }))
            });
        }

        const ticketType = await updateTicketType(id, validate.data);

        res.status(200).json({
            message: "Cập nhật loại vé thành công",
            ticketType
        });
    } catch (err) {
        console.error("Lỗi khi cập nhật loại vé:", err);
        res.status(500).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};

export const deleteTicketTypeById = async (req, res) => {
    try {
        const { id } = req.params;

        await deleteTicketType(id);

        res.status(200).json({
            message: "Xóa loại vé thành công"
        });
    } catch (err) {
        console.error("Lỗi khi xóa loại vé:", err);

        if (err.message.includes("đang được sử dụng")) {
            return res.status(400).json({
                message: err.message
            });
        }

        res.status(500).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};

export const putUpdateTicketSoldById = async (req, res) => {
    try {
        const { id } = req.params;
        const { sold } = req.body;

        if (typeof sold !== 'number' || sold < 0) {
            return res.status(400).json({
                message: "Số lượng vé đã bán phải là số không âm"
            });
        }

        const ticketType = await updateTicketSold(id, sold);

        res.status(200).json({
            message: "Cập nhật số lượng vé đã bán thành công",
            ticketType
        });
    } catch (err) {
        console.error("Lỗi khi cập nhật số lượng vé đã bán:", err);
        res.status(500).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};
