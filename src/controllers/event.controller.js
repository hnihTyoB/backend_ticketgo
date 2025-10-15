import { TOTAL_ITEM_PER_PAGE } from "../config/constant.js";
import {
    countTotalEventPages,
    findAllEvents,
    findEventById,
    createEvent,
    removeEvent,
    updateEvent
} from "../services/event.service.js";
import { eventSchema } from "../validation/event.schema.js";

export const getAllEvents = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || TOTAL_ITEM_PER_PAGE;
    try {
        const events = await findAllEvents(page, limit);
        const totalPages = await countTotalEventPages(limit);
        res.json({ events, totalPages });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const getEventById = async (req, res) => {
    try {
        const event = await findEventById(req.params.id);
        if (!event) return res.status(404).json({ error: "Event not found" });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const postCreateEvent = async (req, res) => {
    try {
        const validate = await eventSchema.safeParseAsync(req.body);

        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => `${err.message}`)
            });
        }

        const { title, description, category, location, startDate, duration, organizer, bannerUrl } = validate.data;

        const newEvent = await createEvent({
            title,
            description,
            category,
            location,
            startDate: new Date(startDate),
            duration,
            organizer,
            bannerUrl
        });

        res.status(201).json({ message: "Tạo sự kiện thành công", event: newEvent });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const putUpdateEvent = async (req, res) => {
    try {
        const validate = await eventSchema.safeParseAsync(req.body);

        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => `${err.message}`)
            });
        }

        const { title, description, category, location, startDate, duration, organizer, bannerUrl } = validate.data;

        const updatedEvent = await updateEvent(req.params.id, {
            title,
            description,
            category,
            location,
            startDate: startDate ? new Date(startDate) : undefined,
            duration,
            organizer,
            bannerUrl
        });

        res.json({ message: "Cập nhật sự kiện thành công", event: updatedEvent });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        await removeEvent(req.params.id);
        res.json({ message: "Xóa sự kiện thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};
