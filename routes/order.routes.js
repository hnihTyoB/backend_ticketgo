import express from "express";
import { getAllOrders, getOrderById } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", getAllOrders);
router.get("/:id", getOrderById);

export default router;