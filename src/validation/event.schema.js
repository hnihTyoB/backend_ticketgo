import { z } from "zod";

export const eventSchema = z.object({
    title: z.string()
        .trim()
        .min(1, { message: "Tiêu đề sự kiện là bắt buộc" }),

    description: z.string()
        .trim()
        .min(10, { message: "Mô tả sự kiện phải có ít nhất 10 ký tự" }),

    category: z.string()
        .trim()
        .min(1, { message: "Danh mục sự kiện là bắt buộc" }),

    location: z.string()
        .trim()
        .min(1, { message: "Địa điểm sự kiện là bắt buộc" }),

    startDate: z.string()
        .refine(val => !isNaN(Date.parse(val)), { message: "Ngày bắt đầu không hợp lệ" })
        .transform(val => new Date(val)),

    duration: z.string()
        .trim()
        .min(1, { message: "Thời lượng sự kiện là bắt buộc" }),

    organizer: z.string()
        .trim()
        .min(1, { message: "Người tổ chức sự kiện là bắt buộc" }),

    bannerUrl: z.string()
        .trim()
        .min(1, { message: "Banner sự kiện là bắt buộc" }),
});
