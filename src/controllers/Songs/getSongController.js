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
        try {
            const { name, offset = 0 } = req.query;
            const limit = 10;
            const regex = new RegExp(`^${name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, "i");
    
            let dbSongs = await Songs.find({ name: { $regex: regex } }, {}, { limit, skip: parseInt(offset) })
                             .populate('idArtist', 'name'); // Asegúrate de que esto devuelve los nombres de los artistas
    
            if (dbSongs.length < limit) {
                await this.searchAndSaveSpotifySongs(name, limit - dbSongs.length, parseInt(offset), dbSongs);
            }
    
            // Transforma la lista de canciones para incluir solo los nombres de los artistas bajo el campo "artists"
            const transformedSongs = dbSongs.map(song => ({
                ...song.toObject(), // Convierte el documento a un objeto plano
                artists: song.idArtist.map(artist => artist.name) // Extrae solo el nombre del artista y cambia el nombre del campo a "artists"
            }));
    
            return res.json({
                message: { description: "Operación exitosa", code: 0 },
                data: { Songs: transformedSongs }
            });
        } catch (error) {
            console.error("Error en getSongsbyName:", error);
            return res.status(500).json({
                message: { description: 'Error interno del servidor', code: 1 },
                data: {}
            });
        }
    }
    async searchAndSaveSpotifySongs(name, limit, offset, dbSongs) {
        const spotifyResponse = await this.spotify.getTracks({ by: 'name', param: name, limit, offset });
        let foundSongs = false;
    
        for (const song of spotifyResponse) {
            if (song.name.toLowerCase().startsWith(name.toLowerCase())) {
                foundSongs = true;
                let existingSong = await Songs.findOne({ name: song.name });
                if (!existingSong) {
                    const songDoc = new Songs({
                        name: song.name,
                        genres: song.genres,
                        duration: song.duration,
                        image: song.image,
                        url_cancion: song.url_track,
                        idArtist: []
                    });
    
                    for (const artistObj of song.artists) {
                        let artist = await this.findOrCreateArtist(artistObj);
                        songDoc.idArtist.push(artist._id);
                    }
    
                    await songDoc.save();
                    dbSongs.push(songDoc);
                } else {
                    dbSongs.push(existingSong);
                }
            }
        }
    
        if (!foundSongs) {
            throw new Error(`No hay canciones por el nombre: ${name}`);
        }
    }

    async findOrCreateArtist(artistObj) {
        let existingArtist = await Artist.findOne({ name: artistObj.name });
        if (!existingArtist) {
            existingArtist = new Artist({
                name: artistObj.name,
                genres: artistObj.genres,
                image: artistObj.image,
                popularity: artistObj.popularity
            });
            await existingArtist.save();
        }
        return existingArtist;
    }
}

export default SongsController;