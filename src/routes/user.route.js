import express from "express";
import userController from "../controllers/user.controller.js";
import hashPassword from '../middleware/passwordEncrypt.js';

const router = express.Router();

// Definir las rutas
router.post("/user/register", hashPassword, userController.registerUser);
router.get("/user/list", userController.getUsers);
router.put("/user/update/:id", userController.updateUser);
router.get("/user/getOne/:id", userController.getUserById);
router.delete("/user/delete/:id", userController.deleteUser);
router.patch("/user/updatePass/:id", hashPassword, userController.updatePassword);

// Exportar las rutas
export default router;
