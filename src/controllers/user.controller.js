import { TOTAL_ITEM_PER_PAGE } from "../config/constant.js";
import {
    findAllUsers,
    countTotalUserPages,
    findUserById,
    createUser,
    updateUser,
    removeUser,
    findAllRoles,
} from "../services/user.service.js";
import { createSchema, updateSchema } from "../validation/user.schema.js";

export const getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || TOTAL_ITEM_PER_PAGE;
    try {
        const users = await findAllUsers(page, limit);
        const totalPages = await countTotalUserPages(limit);
        res.json({ users, totalPages });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await findUserById(req.params.id);
        if (!user) return res.status(404).json({ error: "Không tìm thấy người dùng" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const getAllRoles = async (req, res) => {
    try {
        const roles = await findAllRoles();
        res.json({ roles });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const postCreateUser = async (req, res) => {
    try {
        const validate = await createSchema.safeParseAsync(req.body);
        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => err.message)
            });
        }

        const { fullName, email, phone, birthDate, gender, roleId, accountType } = validate.data;
        const avatar = req.file ? req.file.filename : null;

        const newUser = await createUser({
            fullName,
            phone,
            email,
            birthDate: birthDate ? new Date(birthDate) : undefined,
            gender,
            avatar,
            accountType: accountType || "SYSTEM",
            roleId: Number(roleId),
        });

        res.status(201).json({ message: "Tạo người dùng thành công", user: newUser });
    } catch (err) {
        console.error("Create user error:", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const putUpdateUser = async (req, res) => {
    try {
        const validate = await updateSchema.safeParseAsync(req.body);
        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => err.message)
            });
        }

        const { fullName, phone, birthDate, gender, roleId, accountType } = validate.data;
        const avatar = req.file ? req.file.filename : null;

        const updatedUser = await updateUser(req.params.id, {
            fullName,
            phone,
            birthDate: birthDate ? new Date(birthDate) : undefined,
            gender,
            avatar,
            accountType,
            roleId: roleId ? Number(roleId) : undefined
        });

        res.json({ message: "Cập nhật người dùng thành công", user: updatedUser });
    } catch (err) {
        console.error("Update user error:", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await removeUser(req.params.id);
        res.json({ message: "Xóa người dùng thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};
