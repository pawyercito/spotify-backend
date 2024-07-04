// Importa el modelo Songs
import Songs from '../../models/Songs.js';

class SongsByDurationController {
    constructor() {
        console.log("Creando instancia de SongsByDurationController...");
    }

    async getSongsByDuration(req, res) {
        console.log("Accediendo a getSongsByDuration");
        try {
            const { minDuration, maxDuration, offset, limit } = req.query;

            // Define el límite y salto para paginación
            const queryLimit = limit ? parseInt(limit) : 10; // Si no se define un límite, usa 10 por defecto
            const skipAmount = offset ? parseInt(offset) : 0; // Si no se define un offset, comienza desde el principio

            // Construye el pipeline de agregación
            const pipeline = [
                {
                    $match: {
                        duration: {
                            $gte: minDuration ? parseFloat(minDuration) : 0, // Usa $gte para filtrar por duración mínima
                            $lte: maxDuration ? parseFloat(maxDuration) : Number.MAX_SAFE_INTEGER // Usa $lte para filtrar por duración máxima
                        }
                    }
                },
                {
                    $group: {
                        _id: "$name", // Agrupa por el campo `name`
                        doc: { $first: "$$ROOT" } // Mantén el primer documento en cada grupo
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: "$doc"
                    }
                },
                {
                    $lookup: {
                        from: "artists",
                        localField: "idArtist",
                        foreignField: "_id",
                        as: "idArtist"
                    }
                },
                {
                    $skip: skipAmount
                },
                {
                    $limit: queryLimit
                },
                {
                    $sort: {
                        duration: 1 // Ordena las canciones por duración de manera ascendente
                    }
                }
            ];

            const songs = await Songs.aggregate(pipeline);

            // Prepara la respuesta ajustando la estructura según lo solicitado
            const responseSongs = songs.map(song => ({
                name: song.name,
                duration: parseFloat(song.duration.toFixed(2)), // Mantiene la duración en minutos, redondeada a 2 decimales para la respuesta
                genres: song.genres,
                image: song.image,
                url_cancion: song.url_cancion,
                Artist: song.idArtist.map(artist => artist.name) // Extrae solo el nombre de cada artista
            }));

            res.json({
                message: {
                    description: "Se obtuvo la canción correctamente",
                    code: 0 // Indicamos éxito al encontrar y obtener la canción
                },
                data: responseSongs
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: {
                    description: 'Error interno del servidor',
                    code: 1 // Indicamos un error en el proceso
                },
                data: {} // La descripción está vacía porque hubo un error
            });
        }
    }
}

export default SongsByDurationController;
