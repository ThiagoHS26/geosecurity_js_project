'use strict'
import CriminalCase from "../models/criminalCase.model.js";
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dbscan from 'density-clustering';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getCriminalCase = async (req, res) => {
    try {
        const crimes = await CriminalCase.find();
        res.json(crimes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch crimes' });
    }
}

const getCriminalCaseById = async (req, res) => {
  try {
        const crime = await CriminalCase.findById(req.params.id);
        if (!crime) return res.status(404).json({ message: "Case not found" });
        res.json(crime);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch crime' });
    }
}

const registerCriminalCase = async (req, res) => {
    try {
        console.log("Se ha alcanzado la ruta POST /crimes/register");  // Para depurar
        const { type, location, date, description } = req.body;
        const newCriminalCase = new CriminalCase({
            type,
            location,
            date,
            description,
        });
        await newCriminalCase.save();
        res.status(201).json(newCriminalCase);
    } catch (error) {
        res.status(500).json({ error: 'Failed to register criminal case' });
    }
}

const deleteCriminalCase = async (req, res) => {
    try {
        const {id} = req.params;
        const delCrimeCase = await CriminalCase.findByIdAndDelete(id);
        if (!delCrimeCase) return res.status(404).json({message: "Case not found"});
        res.status(201).json({message: "Crime case deleted!"});
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete criminal case' });
    }
}

const updateCriminalCase = async (req, res) => {
  try {
        const { id } = req.params;
        const { type, location, date, description } = req.body;
        const updatedCrimeCase = await CriminalCase.findByIdAndUpdate(id, { type, location, date, description }, { new: true });
        if (!updatedCrimeCase) return res.status(404).json({ message: "Case not found"});
        res.json(updatedCrimeCase);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update criminal case' });
    }
}

const clusterCrimes = async (req, res) => {
    try {
        // Obtener los crímenes de la base de datos
        const crimes = await CriminalCase.find();
        const coordinates = crimes.map(crime => crime.location.coordinates);

        // Configurar DBSCAN con epsilon y minPts
        const db = new dbscan.DBSCAN();
        const epsilon = 0.01; // Ajusta según la densidad
        const minPts = 3;     // Mínimo número de puntos para formar un cluster
        const clusters = db.run(coordinates, epsilon, minPts);

        // Devolver los crímenes agrupados
        const clusteredCrimes = clusters.map(cluster => {
            return cluster.map(index => crimes[index]);
        });

        res.json({ clusteredCrimes });
    } catch (error) {
        res.status(500).json({ error: 'Error al realizar el clustering de crímenes' });
    }
};

//Carga masiva de informacion desde un archivo .xlsx
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    const filePath = path.join(__dirname, '../../uploads', req.file.filename);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(worksheet);

    // Mapea los datos para ajustarlos al formato esperado por el modelo de MongoDB
    const data = rawData.map(item => ({
      type: item.Type, // Asegúrate que coincida con tu archivo
      location: {
        type: 'Point',
        coordinates: [item.Longitude, item.Latitude], // Formato esperado por GeoJSON
      },
      date: new Date(item.Date), // Convertir a formato Date
      description: item.Description || '', // Descripción opcional
    }));

    // Validación básica de datos
    const invalidData = data.filter(item => {
      return !item.type || !item.location.coordinates || !item.date;
    });

    if (invalidData.length > 0) {
      return res.status(400).json({ message: 'Algunos datos no son válidos', invalidData });
    }

    // Inserta los datos en MongoDB
    await CriminalCase.insertMany(data);

    // Elimina el archivo después de procesarlo
    fs.unlinkSync(filePath);

    return res.status(200).json({ message: 'Archivo procesado y datos cargados en MongoDB' });
  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    return res.status(500).json({ message: 'Error al procesar el archivo o cargar los datos', error });
  }
};

export default {
    getCriminalCase,
    getCriminalCaseById,
    registerCriminalCase,
    deleteCriminalCase,
    updateCriminalCase,
    clusterCrimes,
    uploadFile
};