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
    
            // Asegurarse de que la población de idArtist se realiza correctamente
            let dbSongs = await Songs.find({ name: { $regex: regex } }, {}, { limit, skip: parseInt(offset) })
                             .populate('idArtist', 'name'); // Población correcta de idArtist
    
            if (dbSongs.length < limit) {
                await this.searchAndSaveSpotifySongs(name, limit - dbSongs.length, parseInt(offset), dbSongs);
            }
    
            const currentUser = req.user;
    
            // Transformar la lista de canciones para ajustar el formato de artistas
            const transformedSongs = await Promise.all(dbSongs.map(async song => {
                const { _id, name, duration, genres, image, url_cancion, idArtist, likes, likedBy, __v } = song.toObject();
                const artists = await Promise.all(idArtist.map(async artistId => {
                    const artist = await Artist.findById(artistId);
                    return { id: artist._id, name: artist.name };
                }));
                return {
                    _id,
                    name,
                    duration,
                    genres,
                    image,
                    url_cancion,
                    likes: likes || 0,
                    likedBy,
                    __v,
                    artists,
                    isLiked: currentUser ? song.likedBy.includes(currentUser._id.toString()) : false
                };
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
