import express from "express";
import { handleUserLogin } from "../services/auth.service.js";

const router = express.Router();

export const userLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const token = await handleUserLogin(username, password);
        res.json({ token });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

export default router;
