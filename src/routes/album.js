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

router.get('/get-albums-by-genre', (req, res) => {
    const albumsGenreControllerInstance = new AlbumsGenreController();
    albumsGenreControllerInstance.getAlbumsByGenre(req, res);
});

export default router;


