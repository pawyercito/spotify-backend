import express from "express";
const router = express.Router()
import SongsController from '../controllers/Songs/getSongController.js';
import SongsByArtistController from '../controllers/Songs/getSongByArtistController.js';
import getSongById from '../controllers/Songs/getSongByIdController.js';
import SongsByGenresController  from '../controllers/Songs/getSongByGenresController.js';
import SongsByDurationController from '../controllers/Songs/getSongByDuration.js';
import AlbumsAndSongsController from '../controllers/Tops/getSongByTopGenres.js';
import { authenticateUser } from "../../middleware_auth.js";

const AlbumAndSongsInstance = new AlbumsAndSongsController();

const songsControllerByDuration = new SongsByDurationController();

const songsControllerInstanceByGenres = new SongsByGenresController();

const songsControllerInstanceByArtist = new SongsByArtistController();

const songsControllerInstance = new SongsController();


// Obtener canciones por nombre

// Middleware para instanciar el controlador y llamar al método correcto
router.get('/get-songs-by-name', authenticateUser, (req, res) => {
  const songsControllerInstance = new SongsController();
  songsControllerInstance.getSongsByName(req, res);
});


//Middleware para instanciar el controlador y llamar al metodo correcto para getSongsByArtist  
router.get('/get-songs-by-artist', authenticateUser, (req, res) => {
  const songsByArtistControllerInstance = new SongsByArtistController();
  songsByArtistControllerInstance.getSongsByArtist(req, res);
});

   // Obtener canciones por Id
   router.get('/get-song/:id', authenticateUser, getSongById);

   // Obtener canciones por generos
// Obtener canciones por géneros
router.get('/get-songs-by-genres', authenticateUser, (req, res) => {
  songsControllerInstanceByGenres.getSongsByGenres(req, res);
});

   //Obtener canciones por duración
   router.get('/get-songs-by-duration', authenticateUser, songsControllerByDuration.getSongsByDuration);

    //Middleware para inicializar el controlador y llamar al método correcto
    router.get('/get-combined-genres-albums-songs', authenticateUser, (req, res) => AlbumAndSongsInstance.getCombinedResponse(req, res));


export default router


