import Songs from '../../models/Songs.js';

class SongsByGenresController {
    async getSongsByGenres(req, res) {
        try {
            const { genres, offset, limit } = req.query;

            const parsedGenres = Array.isArray(genres) ? genres : genres.split(',').map(genre => genre.trim().toLowerCase());
            const queryLimit = limit ? parseInt(limit) : 10;
            const skipAmount = offset ? parseInt(offset) : 0;

            // Construye el pipeline de agregación
            const pipeline = [
                {
                    $match: {
                        genres: {
                            $in: parsedGenres
                        }
                    }
                },
                {
                    $skip: skipAmount
                },
                {
                    $limit: queryLimit
                },
                {
                    $lookup: {
                        from: "artists",
                        localField: "idArtist",
                        foreignField: "_id",
                        as: "idArtist"
                    }
                }
            ];

            const songs = await Songs.aggregate(pipeline).exec();

            // Obtener el usuario actual desde el middleware de autenticación
            const currentUser = req.user;

            // Preparar la respuesta ajustando la estructura según lo solicitado
            const responseSongs = songs.map(song => ({
                _id: song._id,
                name: song.name,
                duration: song.duration,
                genres: song.genres,
                image: song.image,
                url_cancion: song.url_cancion,
                artist: song.idArtist.map(artist => artist.name),
                likes: song.likes || 0,
                isLiked: currentUser ? (song.likedBy && song.likedBy.map(String).includes(currentUser._id.toString())) : false
            }));

            res.json({
                message: {
                    description: "Se obtuvieron las canciones correctamente",
                    code: 0
                },
                data: responseSongs
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: {
                    description: 'Error interno del servidor',
                    code: 1
                },
                data: {}
            });
        }
    }
}

export default SongsByGenresController;
