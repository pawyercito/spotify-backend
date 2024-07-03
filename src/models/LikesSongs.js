import mongoose from 'mongoose';

export const LikeSchema = new mongoose.Schema({
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    idSong: { type: mongoose.Schema.Types.ObjectId, ref: 'Songs' },
});

