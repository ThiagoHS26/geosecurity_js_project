import express from 'express';
import { googleAuth, googleAuthCallback, currentUser, logout } from '../controllers/auth.controller.js';

const router = express.Router();

// Iniciar sesión con Google
router.get('/google', googleAuth);

// Callback de Google
router.get('/google/callback', googleAuthCallback);

// Obtener información del usuario actual
router.get('/current_user', currentUser);

// Cerrar sesión
router.get('/logout', logout);

export default router;

