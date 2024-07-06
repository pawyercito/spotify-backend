import Playlist from '../../models/Playlist.js';

export const modifyPlaylist = async (req, res) => {
    try {
        // Extraer la playlist a modificar
        const { idPlaylist, name, image, idSong } = req.body;
        const playlist = await Playlist.findById(idPlaylist);

        if (!playlist) {
            return res.status(404).json({
                message: {
                    code: 404,
                    description: 'Playlist no encontrada'
                }
            });
        }

        // Verificar si el userId de la playlist coincide con el userId del usuario autenticado
        if (playlist.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: {
                    code: 403,
                    description: 'Acceso denegado: No tienes permiso para modificar esta playlist.'
                }
            });
        }

        // Modificar solo los campos que están presentes en la solicitud
        if (name) {
            playlist.name = name;
        }
        if (image) {
            playlist.image = image;
        }
        if (idSong) {
            playlist.idSong = idSong;
        }

        // Guardar la playlist modificada
        const savedPlaylist = await playlist.save();

        // Formatear la respuesta según las nuevas especificaciones
        const response = {
            message: {
                code: 200,
                description: 'Playlist modificada correctamente'
            },
            data: {
                playlist: savedPlaylist
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: {
                code: 500,
                description: 'Error interno del servidor'
            },
            error: error.message
        });
    }
};
