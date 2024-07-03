import mongoose from 'mongoose';


const AlbumSchema = new mongoose.Schema({
    idAlbum: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    idSong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Songs' }],
    genre : [{ type: String, required: true }],
    image : { type: String, required: true },
    popularity: { type: Number, required: false },
    idArtist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
});

export default mongoose.model('Album', AlbumSchema);



