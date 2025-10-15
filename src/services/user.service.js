import { prisma } from "../config/client.js";
import { hashPassword } from "./auth.service.js";

export const findAllUsers = async (page, limit) => {
    const skip = (page - 1) * limit;
    const users = await prisma.user.findMany({
        skip,
        take: limit,
    });
    return users;
};

export const countTotalUserPages = async (limit) => {
    const totalItems = await prisma.user.count();
    return Math.ceil(totalItems / limit);
};

export const findAllRoles = async () => {
    return await prisma.role.findMany();
};

export const findUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id: Number(id) },
    });
};

export const createUser = async (data) => {
    const hashedPassword = await hashPassword("123456");
    return await prisma.user.create({
        data: {
            fullName: data.fullName,
            phone: data.phone,
            email: data.email,
            password: hashedPassword,
            birthDate: data.birthDate,
            gender: data.gender,
            avatar: data.avatar || null,
            accountType: data.accountType || "SYSTEM",
            role: {
                connect: { id: Number(data.roleId) }
            },
        },
    });
};

export const updateUser = async (id, data) => {
    const dataToUpdate = { ...data };

    if (data.roleId) {
        dataToUpdate.role = { connect: { id: Number(data.roleId) } };
        delete dataToUpdate.roleId;
    }

    return await prisma.user.update({
        where: { id: Number(id) },
        data: dataToUpdate,
    });
};

export const removeUser = async (id) => {
    return await prisma.user.delete({
        where: { id: Number(id) },
    });
};
