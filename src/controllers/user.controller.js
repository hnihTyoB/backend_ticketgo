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
import { generateTokenForUser } from "../services/auth.service.js";
import fs from "fs";
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
        const userData = {
            ...req.body,
            roleId: Number(req.body.roleId)
        };
        const validate = await createSchema.safeParseAsync(userData);
        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => ({
                    path: err.path[0],
                    message: err.message
                }))
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
            roleId: roleId,
        });

        res.status(201).json({ message: "Tạo người dùng thành công", user: newUser });
    } catch (err) {
        console.error("Create user error:", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

export const putUpdateUser = async (req, res) => {
    try {
        const userData = {
            ...req.body,
            roleId: Number(req.body.roleId)
        };
        const validate = await updateSchema.safeParseAsync(userData);
        if (!validate.success) {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: validate.error.issues.map(err => ({
                    path: err.path[0],
                    message: err.message
                }))
            });
        }

        const { fullName, phone, birthDate, gender, roleId, accountType } = validate.data;

        const updateData = {
            fullName,
            phone,
            birthDate: birthDate ? new Date(birthDate) : undefined,
            gender,
            accountType: accountType || "SYSTEM",
            roleId: roleId
        };

        if (req.file) {
            const currentUser = await findUserById(req.params.id);
            if (currentUser && currentUser.avatar) {
                const oldAvatarPath = `../Frontend/public/images/user/${currentUser.avatar}`;
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
            }
            updateData.avatar = req.file.filename;
        }

        const updatedUser = await updateUser(req.params.id, updateData);

        // Generate new token with updated user info
        const newToken = await generateTokenForUser(req.params.id);

        res.json({
            message: "Cập nhật người dùng thành công",
            user: updatedUser,
            token: newToken
        });
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
