// models/Like.js
import mongoose from 'mongoose';

const LikeSchema = new mongoose.Schema({
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    idSong: { type: mongoose.Schema.Types.ObjectId, ref: 'Songs', required: true }
});

export default mongoose.model('Like', LikeSchema);
