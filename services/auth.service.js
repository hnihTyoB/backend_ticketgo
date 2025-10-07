import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/client.js";
import { ACCOUNT_TYPE } from "../config/constant.js";
import process from "process";

const saltRounds = 10;

export const hashPassword = async (plainText) => {
    return await bcrypt.hash(plainText, saltRounds);
};

export const comparePassword = async (plainText, hashedPassword) => {
    return await bcrypt.compare(plainText, hashedPassword);
};

export const handleUserLogin = async (username, password) => {
    const user = await prisma.user.findUnique({
        where: { username },
        include: { role: true },
    });

    if (!user) {
        throw new Error(`User ${username} does not exist`);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        throw new Error("Incorrect password");
    }

    const payload = {
        id: user.id,
        username: user.username,
        roleId: user.roleId,
        role: user.role,
        accountType: user.accountType,
        avatar: user.avatar,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in the .env file");
    }

    return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN });
};

export const isEmailExist = async (email) => {
    const user = await prisma.user.findUnique({
        where: { username: email },
    });
    return !!user;
}

export const registerUser = async (email, password) => {
    const newPassword = await hashPassword(password);
    const userRole = await prisma.role.findUnique({
        where: { name: 'User' }
    });
    if (!userRole) {
        throw new Error("Default user role not found");
    }
    const newUser = await prisma.user.create({
        data: {
            username: email,
            password: newPassword,
            accountType: ACCOUNT_TYPE.SYSTEM,
            roleId: userRole.id,
        }
    });
    return newUser;
}

export const findUserWithRoleById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: { role: true },
        omit: { password: true }
    });
    return user;
}

export const countUserSumCart = async (id) => {
    const user = await prisma.cart.findUnique({
        where: { userId: parseInt(id) }
    });
    return user?.sum || 0;
}