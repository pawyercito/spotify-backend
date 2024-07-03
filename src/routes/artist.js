import express from "express";
const router = express.Router()

import {createArtist} from '../controllers/Artist/artistCreateController.js';
import {modifyArtist} from '../controllers/Artist/artistModifyController.js';
import {deleteArtist} from '../controllers/Artist/artistDeleteController.js';
import {getArtistById} from '../controllers/Artist/artistGetByIdController.js';

// Añadir Artista

router.post('/add-artist', createArtist);

// Modificar Artista

router.put('/modify-artist/:idArtist', modifyArtist);

// Eliminar Artista

router.delete('/delete-artist/:idArtist', deleteArtist);

// Obtener Artista por ID

router.get('/get-artist/:idArtist', getArtistById);

export default router
