import Artist from '../../models/Artist.js';

export const modifyArtist = async (req, res) => {
    try {
        const { idArtist } = req.params;
        const { genre, image, popularity } = req.body;

        const artist = await Artist.findById(idArtist);

        if (!artist) {
            return res.status(404).json({ message: 'Artista no encontrado' });
        }

        artist.genre = genre;
        artist.image = image;
        artist.popularity = popularity;

        await artist.save();

        res.status(200).json({ message: 'Artista modificado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
