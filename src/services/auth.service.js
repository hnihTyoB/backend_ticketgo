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

export const handleUserLogin = async (identifier, password) => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier },
                { phone: identifier }
            ]
        },
        include: { role: true }
    });

    if (!user) throw new Error(`User ${identifier} does not exist`);

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error("Incorrect password");

    const payload = {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        birthDate: user.birthDate,
        gender: user.gender,
        avatar: user.avatar,
        accountType: user.accountType,
        role: user.role,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined in the .env file");

    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

    return jwt.sign(payload, secret, { expiresIn });
};

export const isEmailExist = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    return !!user;
};

export const isPhoneExist = async (phone) => {
    const user = await prisma.user.findUnique({ where: { phone } });
    return !!user;
};

export const registerUser = async ({ email, password, roleName = "USER" }) => {
    const newPassword = await hashPassword(password);

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error("Default user role not found");

    const newUser = await prisma.user.create({
        data: {
            email,
            password: newPassword,
            accountType: ACCOUNT_TYPE.SYSTEM,
            roleId: role.id,
        }
    });

    return newUser;
};

export const findUserWithRoleById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: { role: true },
        omit: { password: true },
    });
    return user;
};

export const countUserSumCart = async (userId) => {
    const cart = await prisma.ticketCart.findUnique({
        where: { userId: userId },
    });

    if (!cart) return 0;

    const sum = await prisma.ticketCartDetail.aggregate({
        where: { ticketCartId: cart.id },
        _sum: { quantity: true },
    });

    return sum._sum.quantity || 0;
};
