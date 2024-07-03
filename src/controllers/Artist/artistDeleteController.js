import Artist from '../../models/Artist.js';

export const deleteArtist = async (req, res) => {
    try {
        const { idArtist } = req.params;

        const artist = await Artist.findById(idArtist);

        if (!artist) {
            return res.status(404).json({ message: 'Artista no encontrado' });
        }

        await Artist.findByIdAndDelete(idArtist);

        res.status(200).json({ message: 'Artista eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
