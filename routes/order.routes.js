import express from "express";
import { getAllOrders, getOrderById, updateStatus } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", updateStatus);

export default router;