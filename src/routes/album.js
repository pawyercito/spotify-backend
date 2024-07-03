import express from "express";
const router = express.Router();

import AlbumsController from '../controllers/Album/getAlbumByName.js';
import AlbumsIdController from '../controllers/Album/getAlbumById.js';
import AlbumsGenreController from '../controllers/Album/getAlbumByGenre.js';

const AlbumsControllerInstance = new AlbumsController();

// Obtener álbumes por nombre
router.get('/get-album', (req, res) => {
    AlbumsControllerInstance.getAlbumsByName(req, res);
});

// Obtener álbumes por ID
const AlbumsIdControllerInstance = new AlbumsIdController();

router.get('/get-album/:idAlbum', (req, res) => AlbumsIdControllerInstance.getAlbumById(req, res));

// Obtener álbumes por genero
const AlbumsGenreControllerInstance = new AlbumsGenreController();

router.get('/get-albums-by-genre/:genre',AlbumsGenreControllerInstance.getAlbumsByGenre);

export default router;


