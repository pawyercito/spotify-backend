// Importa el modelo Songs
import Songs from '../../models/Songs.js';

class SongsByGenresController {
    constructor() {
        console.log("Creando instancia de SongsByGenresController...");
    }

    async getSongsByGenres(req, res) {
        console.log("Accediendo a getSongsByGenres");
        try {
            const { genres, offset, limit } = req.query;

            // Parsea los géneros a un arreglo si viene como una cadena y normalízalos a minúsculas
            const parsedGenres = Array.isArray(genres)? genres : genres.split(',').map(genre => genre.trim().toLowerCase());

            // Define el límite y salto para paginación
            const queryLimit = limit? parseInt(limit) : 10; // Si no se define un límite, usa 10 por defecto
            const skipAmount = offset? parseInt(offset) : 0; // Si no se define un offset, comienza desde el principio

            // Realiza la consulta a la base de datos con populate para obtener los nombres de los artistas
            const songs = await Songs.find({
                genres: {
                    $in: parsedGenres // Busca canciones donde alguno de los géneros coincida con los proporcionados
                }
            })
            .skip(skipAmount)
            .limit(queryLimit)
            .populate('idArtist', 'name'); // Poblar solo el campo 'name' del modelo Artist

            // Preparar la respuesta ajustando la estructura según lo solicitado
            const responseSongs = songs.map(song => ({
                name: song.name,
                duration: song.duration,
                genres: song.genres,
                image: song.image,
                url_cancion: song.url_cancion,
                Artist: song.idArtist.map(artist => artist.name) // Extraer solo el nombre de cada artista
            }));

            res.json({
                message: {
                    description: "Se obtuvieron las canciones correctamente",
                    code: 0 // Indicamos éxito al encontrar y obtener las canciones
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

export default SongsByGenresController;
