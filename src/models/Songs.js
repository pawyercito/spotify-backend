import mongoose, { Schema } from 'mongoose';


 const SongsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    genres: [{ type: String, required: false }],
    duration: { type: Number, required: true },
    image: { type: String, required: true },
    url_cancion: { type: String, required: false },
    idArtist: [{ type: Schema.Types.ObjectId, ref: 'Artist', required: true }],
});

export default mongoose.model('Songs', SongsSchema);

