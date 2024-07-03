import Album from '../../models/Album.js';
import Songs from '../../models/Songs.js';
import Artist from '../../models/Artist.js';
import Spotify from '../../components/Spotify.js';

class AlbumsController {
    constructor() {
        this.spotify = new Spotify();
    }

    async getAlbumsByName(req, res) {
        const { name } = req.query;
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        if (!name) {
            console.error('El nombre del álbum es requerido');
            return res.status(400).json({
                message: {
                    description: 'El nombre del álbum es requerido',
                    code: 2
                },
                data: {}
            });
        }

        console.log(`Buscando álbumes por nombre: ${name}, offset: ${offset}, limit: ${limit}`);

        try {
            console.log('Consultando álbumes en la base de datos local...');
            let albumsFromDB = await Album.find({ name: { $regex: new RegExp(name, 'i') } })
                .skip(offset)
                .limit(limit)
                .populate('idSong', 'name duration image') // Populando canciones
                .populate('idArtist', 'name genres image popularity') // Populando artistas
                .exec();

            console.log(`Álbumes obtenidos de la base de datos: ${albumsFromDB.length}`);

            if (albumsFromDB.length < limit) {
                const remaining = limit - albumsFromDB.length;
                console.log(`Faltan ${remaining} álbumes, consultando a Spotify...`);

                const spotifyAlbums = await this.spotify.getAlbums({ by: 'name', param: name, limit: remaining, offset: offset });
                console.log(`Álbumes obtenidos de Spotify: ${spotifyAlbums.length}`);

                for (const spotifyAlbum of spotifyAlbums) {
                    const trackIds = [];

                    for (const track of spotifyAlbum.tracks) {
                        let existingSong = await Songs.findOne({ name: track.name });
                        let songId;

                        if (!existingSong) {
                            const newSong = new Songs({
                                name: track.name,
                                genres: track.genres,
                                duration: track.duration,
                                image: track.image,
                                url_cancion: track.url,
                                idArtist: [] // Initialize with an empty array
                                
                            });

                            try {
                                const savedSong = await newSong.save();
                                songId = savedSong._id;
                            } catch (error) {
                                console.error(`Error al guardar la canción ${track.name}: ${error.message}`);
                                continue; // Continue with the next song if there's an error
                            }
                        } else {
                            songId = existingSong._id;
                        }

                        trackIds.push(songId);
                    }

                    const artistIds = [];

                    for (const artist of spotifyAlbum.artists) {
                        let existingArtist = await Artist.findOne({ name: artist.name });

                        if (!existingArtist) {
                            const newArtist = new Artist({
                                name: artist.name,
                                genres: artist.genres,
                                image: artist.image,
                                popularity: artist.popularity
                            });

                            try {
                                existingArtist = await newArtist.save();
                            } catch (error) {
                                console.error(`Error al guardar el artista ${artist.name}: ${error.message}`);
                                continue; // Continue with the next artist if there's an error
                            }
                        }

                        artistIds.push(existingArtist._id);
                    }

                    const newAlbum = new Album({
                        idAlbum: spotifyAlbum.id,
                        name: spotifyAlbum.name,
                        idSong: trackIds,
                        genre: spotifyAlbum.genre,
                        image: spotifyAlbum.image,
                        idArtist: artistIds, // Assign the artist IDs to the album
                        popularity: spotifyAlbum.popularity
                    });

                    try {
                        await newAlbum.save();
                        console.log(`Álbum guardado en la base de datos: ${newAlbum.name}`);
                        albumsFromDB.push(newAlbum); // Add the saved album to the list
                    } catch (error) {
                        console.error(`Error al guardar el álbum ${spotifyAlbum.name}: ${error.message}`);
                        continue; // Continue with the next album if there's an error
                    }
                }
            } else {
                console.log(`Using only albums from the local database.`);
            }

            const responseAlbums = albumsFromDB.map(album => ({
                name: album.name,
                duration: album.idSong.reduce((acc, song) => acc + song.duration, 0) / album.idSong.length,
                genres: album.genre || [],
                image: album.image,
                popularity: album.popularity,
                artists: album.idArtist.map(artist => ({
                    name: artist.name,
                    genres: artist.genres,
                    image: artist.image,
                    popularity: artist.popularity
                })),
                songs: album.idSong.map(song => ({
                    name: song.name,
                    duration: song.duration,
                    image: song.image,
                    url_cancion: song.url_cancion
                }))
            }));

            console.log('Prepared response to send:', responseAlbums);

            res.json({
                message: {
                    description: "Álbumes obtenidos correctamente",
                    code: 0
                },
                data: responseAlbums
            });
        } catch (error) {
            console.error('Error in getAlbumsByName:', error);
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

export default AlbumsController;
