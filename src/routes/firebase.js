import express from "express";
const router = express.Router();
import { authorizeArtist, authenticateUser } from "../../middleware_auth.js";
import FirebaseController from '../controllers/Upload/uploadSong.js';

const FirebaseControllerInstance = new FirebaseController();


router.post('/upload-song', authenticateUser, authorizeArtist, FirebaseControllerInstance.uploadSongFile);


export default router