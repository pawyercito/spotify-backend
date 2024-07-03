import express from "express";
const router = express.Router()
import SongsController from '../controllers/Songs/getSongController.js';
import SongsByArtistController from '../controllers/Songs/getSongByArtistController.js';
import getSongById from '../controllers/Songs/getSongByIdController.js';
import SongsByGenresController  from '../controllers/Songs/getSongByGenresController.js';
import SongsByDurationController from '../controllers/Songs/getSongByDuration.js';
import SongsTopGenreController from '../controllers/Tops/getSongByTopGenres.js';

const songsTopGenreController = new SongsTopGenreController();

const songsControllerByDuration = new SongsByDurationController();

const songsControllerInstanceByGenres = new SongsByGenresController();

const songsControllerInstanceByArtist = new SongsByArtistController();

const songsControllerInstance = new SongsController();


// Obtener canciones por nombre

// Middleware para instanciar el controlador y llamar al método correcto
router.get('/get-songs/:name/:offset?', (req, res ) => {
    const songsControllerInstance = new SongsController();
    songsControllerInstance.getSongsbyName(req, res);
  });
  

//Middleware para instanciar el controlador y llamar al metodo correcto para getSongsByArtist  
router.get('/get-songs-by-artist/:name/:offset?', (req, res ) => {
    const songsControllerInstanceByArtist = new SongsByArtistController();
    songsControllerInstanceByArtist.getSongsByArtist(req, res);
  });

   // Obtener canciones por Id
   router.get('/get-song/:id', getSongById);

   // Obtener canciones por generos
   router.get('/get-songs-by-genres/', songsControllerInstanceByGenres.getSongsByGenres);

   //Obtener canciones por duración
   router.get('/get-songs-by-duration', songsControllerByDuration.getSongsByDuration);

    //Middleware para inicializar el controlador y llamar al método correcto
    router.get('/get-top-genres', (req, res) => songsTopGenreController.getSongsByGenre(req, res));



export default router


