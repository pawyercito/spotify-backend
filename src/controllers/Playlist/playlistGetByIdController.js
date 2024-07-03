import Playlist from '../../models/Playlist.js';
import Songs from '../../models/Songs.js';
import Artist from '../../models/Artist.js';

export const getPlaylistById = async (req, res) => {
    try {
        const { idPlaylist } = req.params;

        // Buscar la playlist por su ID y poblar las canciones con sus detalles, incluyendo el artista
        const playlist = await Playlist.findById(idPlaylist).populate({
            path: 'idSong',  // Campo de referencia al modelo Song en el modelo Playlist
            populate: {
                path: 'idArtist',  // Campo de referencia al modelo Artist en el modelo Song
                model: 'Artist',   // Modelo al que se hace referencia
            },
        });

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Verificar si el userId de la playlist coincide con el userId del usuario autenticado
        if (playlist.userId.toString()!== req.user._id.toString()) {
            return res.status(403).json({ message: 'Acceso denegado: No tienes permiso para acceder a esta playlist.' });
        }

        // Mapear las canciones para incluir el nombre del artista
        const songsWithArtists = playlist.idSong.map(song => ({
            _id: song._id,
            name: song.name,
            idArtist: song.idArtist._id,  // Incluir el ID del artista
            artistName: song.idArtist.name, // Nombre del artista
        }));

        // Construir el objeto de respuesta con el campo "artists"
        const response = {
            message: {
                description: 'Playlist obtained successfully',
                code: 0,
            },
            data: {
                playlist: {
                    _id: playlist._id,
                    name: playlist.name,
                    image: playlist.image,
                    songs: songsWithArtists, // Las canciones ya incluyen el nombre del artista
                    artists: Array.from(new Set(songsWithArtists.map(song => song.artistName))).map(name => ({ name })), // Eliminar duplicados y formatear para la respuesta
                },
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};