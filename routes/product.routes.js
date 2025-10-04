import express from "express";
import fileUploadMiddleware from "../middlewares/fileUpload.js";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getAllProducts);
// router.get("/factories", getAllFactories);
// router.get("/targets", getAllTargets);
router.get("/:id", getProductById);
router.post("/", fileUploadMiddleware("image", "product"), createProduct);
router.put("/:id", fileUploadMiddleware("image", "product"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;