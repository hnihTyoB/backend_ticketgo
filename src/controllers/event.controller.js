import { TOTAL_ITEM_PER_PAGE } from "../config/constant.js";
import { countTotalEventPagesWithFilter, findAllEventsWithFilter } from "../services/event.filter.js";
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
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || TOTAL_ITEM_PER_PAGE;
        const sort = req.query.sort || 'asc';

        const [events, totalPages] = await Promise.all([
            findAllEvents(page, limit, sort),
            countTotalEventPages(limit),
        ]);

        res.status(200).json({
            events,
            totalPages,
        });
    } catch (err) {
        console.error("Lỗi khi lấy danh sách sự kiện:", err);
        res.status(500).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};

export const getAllEventsWithFilter = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || TOTAL_ITEM_PER_PAGE;
        const search = req.query.search || null;
        const category = req.query.category || null;
        const week = req.query.week === 'true';
        const month = req.query.month === 'true';
        const from = req.query.from || null;
        const to = req.query.to || null;
        const sort = req.query.sort || 'desc';

        const [events, totalPages] = await Promise.all([
            findAllEventsWithFilter(page, limit, search, category, week, month, from, to, sort),
            countTotalEventPagesWithFilter(limit, search, category, week, month, from, to),
        ]);

        res.status(200).json({
            events,
            totalPages,
        });
    } catch (err) {
        console.error("Lỗi khi lấy danh sách sự kiện:", err);
        res.status(500).json({
            message: "Lỗi server",
            error: err.message
        });
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
        let bannerUrl = null;
        if (req.file) {
            bannerUrl = req.file.filename;
        }

        const eventData = {
            ...req.body,
            bannerUrl: bannerUrl
        };

        const validate = await eventSchema.safeParseAsync(eventData);
        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => ({
                    path: err.path[0],
                    message: err.message
                }))
            });
        }
        const { title, description, category, location, startDate, duration, organizer, bannerUrl: validatedBannerUrl } = validate.data;
        const newEvent = await createEvent({
            title,
            description,
            category,
            location,
            startDate,
            duration,
            organizer,
            bannerUrl: validatedBannerUrl
        });

        res.status(201).json({ message: "Tạo sự kiện thành công", event: newEvent });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const putUpdateEvent = async (req, res) => {
    try {
        const existingEvent = await findEventById(req.params.id);
        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" });
        }

        let bannerUrl = existingEvent.bannerUrl || null;

        if (req.file) {
            bannerUrl = req.file.filename;
        }

        const eventData = {
            ...req.body,
            bannerUrl: bannerUrl
        };

        const validate = await eventSchema.safeParseAsync(eventData);

        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => ({
                    path: err.path[0],
                    message: err.message
                }))
            });
        }

        const { title, description, category, location, startDate, duration, organizer, bannerUrl: validatedBannerUrl } = validate.data;

        const updatedEvent = await updateEvent(req.params.id, {
            title,
            description,
            category,
            location,
            startDate,
            duration,
            organizer,
            bannerUrl: validatedBannerUrl,
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
        if (err.message.includes("Không thể xóa sự kiện")) {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};
