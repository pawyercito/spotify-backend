import Spotify from '../../components/Spotify.js';
import Songs from '../../models/Songs.js';
import Artist from '../../models/Artist.js';

class SongsController {
    constructor() {
        console.log("Creando instancia de Spotify...");
        this.spotify = new Spotify();
        console.log("Instancia de Spotify creada:", this.spotify);
    }

    async getSongsbyName(req, res) {
        console.log("Accediendo a getSongsbyName, Spotify es:", this.spotify);
        try {
            const { name, offset } = req.query;

            const limit = 10; // Establece el límite a 10 elementos por página
            const skipAmount = offset ? parseInt(offset) : 0; // Convierte offset a un número entero para determinar cuántos elementos saltar

            let regex = new RegExp("^" + name, "i"); // El "^" indica el inicio de la línea, haciendo la búsqueda más precisa

            // Buscar canciones en la base de datos local
            let dbSongs = await Songs.find({ name: { $regex: regex } }, {}, { limit: limit, skip: skipAmount })
                                     .populate('idArtist', 'name'); // Popula el nombre del artista desde el modelo Artist

            console.log("Canciones encontradas en la base de datos local:", dbSongs.length);

            let spotifySongs = [];
            if (dbSongs.length < limit) {
                const spotifyResponse = await this.spotify.getTracks({
                    by: 'name', // Busca por nombre
                    param: name,
                    limit: limit - dbSongs.length,
                    offset: skipAmount,
                });

                console.log("Respuesta de la API de Spotify:", spotifyResponse);

                for (const song of spotifyResponse) {
                    if (song.name.toLowerCase().startsWith(name.toLowerCase())) {
                        let existingSong = await Songs.findOne({ name: song.name });

                        if (!existingSong) {
                            const songDoc = new Songs({
                                name: song.name,
                                genres: song.genres,
                                duration: song.duration,
                                image: song.image,
                                url_cancion: song.url_track, // Guarda la URL de la canción
                                idArtist: []
                            });

                            for (const artistObj of song.artists) {
                                let existingArtist = await Artist.findOne({ name: artistObj.name });
                                if (!existingArtist) {
                                    existingArtist = new Artist({
                                        name: artistObj.name,
                                        genres: artistObj.genres,
                                        image: artistObj.image,
                                        popularity: artistObj.popularity
                                    });
                                    await existingArtist.save(); // Guarda el nuevo artista en la base de datos
                                    console.log("Nuevo artista guardado:", existingArtist);
                                }

                                songDoc.idArtist.push(existingArtist._id);
                            }

                            await songDoc.save();
                            console.log("Nueva canción guardada:", songDoc);
                        } else {
                            console.log("La canción ya existe en la base de datos:", existingSong);
                        }
                    }
                }
            }

            // Vuelve a consultar todas las canciones encontradas o agregadas
            const finalSongs = await Songs.find({ name: { $regex: regex } })
                                          .populate('idArtist', 'name')
                                          .limit(limit)
                                          .skip(skipAmount); 

            console.log("Canciones finales a retornar:", finalSongs.length);
            return res.json({
                message: {
                    description: "Operación exitosa",
                    code: 0
                },
                data: { Songs: finalSongs }
            });
        } catch (error) {
            console.error("Error en getSongsbyName:", error);
            return res.status(500).json({
                message: {
                    description: 'Error interno del servidor',
                    code: 1
                },
                data: {}
            });
        }
    }
}

export default SongsController;
