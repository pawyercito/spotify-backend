// src/routes/index.js
import express from 'express';
import GenresController from '../controllers/Genres/genresGetController.js';

const router = express.Router();

// Añadir la ruta para obtener los géneros
router.get('/genres', GenresController.getGenres);

export default router;
