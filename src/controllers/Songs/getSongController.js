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
            const { name, offset } = req.params;
    
            const limit = 10; // Establece el límite a 10 elementos por página
            const skipAmount = parseInt(offset); // Convierte offset a un número entero para determinar cuántos elementos saltar
    
            // Ajusta la expresión regular para que solo coincida con canciones que comiencen con el nombre especificado
            let regex = new RegExp("^" + name, "i"); // El "^" indica el inicio de la línea, haciendo la búsqueda más precisa
    
            let dbSongs = await Songs.find({ name: { $regex: regex } }, {}, { limit: limit, skip: skipAmount })
                                    .populate('idArtist', 'name'); // Popula el nombre del artista desde el modelo Artist
    
            console.log("Canciones encontradas en la base de datos local:", dbSongs.length);
    
            if (dbSongs.length < limit) {
                const spotifySongs = await this.spotify.getTracks({
                    by: 'name', // Busca por nombre
                    param: name,
                    limit: limit,
                    offset: skipAmount,
                });
    
                console.log("Respuesta de la API de Spotify:", spotifySongs);
    
                for (const song of spotifySongs) {
                    let existingSong = await Songs.findOne({
                        name: song.name,
                        'artists.name': song.artists[0]?.name // Asume que el primer artista es el principal y tiene un nombre
                    });
    
                    if (!existingSong) {
                        const songDoc = await Songs.create({
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
                            }
    
                            songDoc.idArtist.push(existingArtist._id);
                        }
    
                        await songDoc.save();
                    }
                }
            }
    
            // Retorna todas las canciones encontradas o agregadas
            // Asegúrate de usar una expresión regular ajustada al inicio del nombre también en la consulta final
            regex = new RegExp("^" + name, "i");
            const finalSongs = await Songs.find({ name: { $regex: regex } }, {}, { limit: limit, skip: skipAmount })
                                          .populate('idArtist', 'name'); // Vuelve a populart el nombre del artista
    
            return res.json({ Songs: finalSongs });
        } catch (error) {
            console.error("Error en getSongsbyName:", error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
}

export default SongsController;
