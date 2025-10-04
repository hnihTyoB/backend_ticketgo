import express from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllRoles,
} from "../controllers/user.controller.js";
import fileUploadMiddleware from "../middlewares/fileUpload.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/roles", getAllRoles);
router.get("/:id", getUserById);
router.post("/", fileUploadMiddleware("avatar"), createUser);
router.put("/:id", fileUploadMiddleware("avatar"), updateUser);
router.delete("/:id", deleteUser);

export default router;