import Artist from '../../models/Artist.js';

export const getArtistById = async (req, res) => {
    try {
        const { idArtist } = req.params;

        const artist = await Artist.findById(idArtist);

        if (!artist) {
            return res.status(404).json({ message: 'Artista no encontrado' });
        }

        res.status(200).json(artist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
