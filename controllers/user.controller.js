import {
    findAllUsers,
    countTotalUserPages,
    findUserById,
    insertUser,
    modifyUser,
    removeUser,
    findAllRoles,
} from "../services/user.service.js";
import { CreateSchema, updateSchema } from "../validation/register.schema.js";

export const getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    try {
        const users = await findAllUsers(page);
        const totalPages = await countTotalUserPages();
        res.json({ users, totalPages });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await findUserById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const createUser = async (req, res) => {
    try {
        const validate = await CreateSchema.safeParseAsync(req.body);
        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => `${err.message}`)
            });
        }
        const { fullName, username, phone, role, address } = validate.data;
        const avatar = req.file ? req.file.filename : undefined;
        const newUser = await insertUser(
            fullName,
            username,
            phone,
            role,
            avatar,
            address
        );
        res.status(201).json({ message: "Tạo user thành công", user: newUser });
    } catch (err) {
        console.error("Create user error:", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const validate = await updateSchema.safeParseAsync(req.body);
        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => `${err.message}`)
            });
        }
        const { fullName, phone, roleId, address } = validate.data;
        const avatar = req.file ? req.file.filename : undefined;
        const updatedUser = await modifyUser(
            req.params.id,
            fullName,
            phone,
            roleId,
            avatar,
            address
        );
        res.json({ message: "Cập nhật user thành công", user: updatedUser });
    } catch (err) {
        console.error("Update user error:", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await removeUser(req.params.id);
        res.json({ message: "Xóa user thành công" });
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
