import Songs from '../../models/Songs.js';

export const likeSong = async (req, res) => {
    const { songId } = req.body;
    const userId = req.user._id; // ID del usuario autenticado

    try {
        // Verificar si la canción existe
        const song = await Songs.findById(songId);
        if (!song) {
            return res.status(404).json({
                message: {
                    description: 'Canción no encontrada',
                    code: 1
                },
                data: {}
            });
        }

        // Verificar si el usuario ya dio like a esta canción
        const alreadyLiked = song.likedBy.includes(userId);
        if (alreadyLiked) {
            return res.status(400).json({
                message: {
                    description: 'Ya has dado like a esta canción',
                    code: 2
                },
                data: {}
            });
        }

        // Agregar el usuario a la lista de likedBy y aumentar el contador de likes
        song.likedBy.push(userId);
        song.likes += 1;

        await song.save();

        res.json({
            message: {
                description: '¡Has dado like a la canción!',
                code: 0
            },
            data: {}
        });
    } catch (error) {
        console.error('Error al dar like a la canción:', error);
        res.status(500).json({
            message: {
                description: 'Error interno del servidor',
                code: 3
            },
            data: {}
        });
    }
};
