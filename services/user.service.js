import { prisma } from "../config/client.js";
import { ACCOUNT_TYPE, TOTAL_ITEM_PER_PAGE } from "../config/constant.js";
import { hashPassword } from "./auth.service.js";

export const findAllUsers = async (page) => {
    const pageSize = TOTAL_ITEM_PER_PAGE;
    const skip = (page - 1) * pageSize;
    const users = await prisma.user.findMany({
        skip: skip,
        take: pageSize,
    });
    return users;
};

export const countTotalUserPages = async () => {
    const totalItems = await prisma.user.count();
    const pageSize = TOTAL_ITEM_PER_PAGE;
    const totalPages = Math.ceil(totalItems / pageSize);
    return totalPages;
}

export const findAllRoles = async () => {
    const roles = await prisma.role.findMany();
    return roles;
}

export const findUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id: parseInt(id) }
    });
};

export const insertUser = async (
    fullName,
    username,
    phone,
    roleId,
    avatar,
    address
) => {
    const hashedPassword = await hashPassword("123456");
    return await prisma.user.create({
        data: {
            fullName, username, phone, roleId: parseInt(roleId), avatar, address,
            password: hashedPassword, accountType: ACCOUNT_TYPE.SYSTEM,
        },
    });
};

export const modifyUser = async (id, fullName, phone, roleId, avatar, address) => {
    const dataToUpdate = {
        fullName,
        phone,
        role: {
            connect: { id: parseInt(roleId) }
        },
        address
    };

    if (avatar) {
        dataToUpdate.avatar = avatar;
    }

    return await prisma.user.update({
        where: { id: parseInt(id) },
        data: dataToUpdate,
    });
};

export const removeUser = async (id) => {
    return await prisma.user.delete({
        where: { id: parseInt(id) },
    });
};
