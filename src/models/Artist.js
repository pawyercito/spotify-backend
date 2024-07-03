import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    genres: [{ type: String, required: false}],
    image: { type: String, required: false },
    popularity: { type: Number, required: true },
});


export default mongoose.model('Artist', ArtistSchema);





