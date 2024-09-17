import express from "express";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import criminalCaseController from "../controllers/criminalCase.controller.js";

const router = express.Router();

// Verifica si la carpeta uploads existe, si no, la crea
const uploadDir = path.join('uploads/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuración de Multer para manejar la subida del archivo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

router.get("/crimes/list", criminalCaseController.getCriminalCase);
router.get("/crimes/getOne/:id", criminalCaseController.getCriminalCaseById);
router.post("/crimes/register", criminalCaseController.registerCriminalCase);
router.delete("/crimes/delete/:id", criminalCaseController.deleteCriminalCase);
router.put('/crimes/update/:id', criminalCaseController.updateCriminalCase);
router.get('/crimes/clusters', criminalCaseController.clusterCrimes);
router.post('/crimes/uploadData', upload.single('file'), criminalCaseController.uploadFile);


export default router;