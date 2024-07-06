import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Agregar el campo userId
    name: { type: String, required: true },
    idSong: [{ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Songs' }],
    isFavorite: { type: Boolean, default: false }, // Indica si la playlist es una de favoritos

});

export default mongoose.model('Playlist', PlaylistSchema);


