import mongoose from 'mongoose';

const SongSchema = new mongoose.Schema({
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    genres: [{ type: String }],
    image: { type: String },
    url_cancion: { type: String },
    idArtist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]  // Array de ObjectId para usuarios que dieron like
});

const Songs = mongoose.model('Songs', SongSchema);

export default Songs;
