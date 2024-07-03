import express from "express";
const router = express.Router()

import {createPlaylist} from "../controllers/Playlist/playlistCreateController.js"
import {modifyPlaylist} from "../controllers/Playlist/playlistModifyController.js"
import {deletePlaylist} from "../controllers/Playlist/playlistDeleteController.js"
import {getPlaylistById} from "../controllers/Playlist/playlistGetByIdController.js"
import {authenticateUser} from "../../middleware_auth.js"


// Modificar Playlist

router.put('/modify-playlist', authenticateUser,  modifyPlaylist);

// Eliminar Playlist

router.delete('/delete-playlist/:playlistId',authenticateUser, deletePlaylist);

// Obtener Playlist por ID

router.get('/get-playlist/:idPlaylist',authenticateUser, getPlaylistById);

// Añadir Playlist

router.post('/add-playlist',authenticateUser, createPlaylist);

export default router
