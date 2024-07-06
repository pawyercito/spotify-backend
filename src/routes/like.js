import express from 'express';
import { authenticateUser } from "../../middleware_auth.js";
import { likeSong } from '../controllers/Likes/LikeSong.js';

const router = express.Router();
// endpoint para dar like
router.post('/songs/like', authenticateUser, likeSong);

export default router