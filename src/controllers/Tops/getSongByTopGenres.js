import Album from '../../models/Album.js';
import Songs from '../../models/Songs.js';
import Artist from '../../models/Artist.js';

class AlbumsAndSongsController {
    constructor() {
        // Puedes inicializar cualquier cosa que necesites aquí
    }

    async getAlbumsByPopularity(offset = 0, limit = 10) {
        try {
            console.log(`Consultando álbumes por popularidad en la base de datos local con offset: ${offset}, limit: ${limit}...`);
            
            let albumsFromDB = await Album.find({})
                .sort({ popularity: -1 })
                .skip(offset)
                .limit(limit)
                .populate({
                    path: 'idSong',
                    select: 'name duration image idArtist',
                    populate: {
                        path: 'idArtist',
                        select: 'name genres image popularity'
                    }
                })
                .populate('idArtist', 'name genres image popularity')
                .exec();
    
            if (albumsFromDB.length === 0) {
                console.log('Álbumes no encontrados');
                return {
                    message: {
                        description: 'No se encontraron álbumes por popularidad',
                        code: 3
                    },
                    data: []
                };
            }
    
            const responseAlbums = await Promise.all(albumsFromDB.map(async album => {
                const songDetails = await Promise.all(album.idSong.map(async song => {
                    const songDetail = await Songs.findById(song._id).select('url_cancion').exec();
                    return {
                        ...song.toObject(),
                        url_cancion: songDetail ? songDetail.url_cancion : ''
                    };
                }));
    
                const artists = await Promise.all(album.idArtist.map(artist=>artist.name)
                    
                );
    
                return {
                    name: album.name,
                    duration: songDetails.reduce((acc, song) => acc + song.duration, 0) / (songDetails.length || 1),
                    genres: album.genres,
                    image: album.image,
                    artists: artists,
                    songs: songDetails.map(song => {
                        if (!song.url_cancion) {
                            console.error(`Missing url_cancion for song: ${song.name}, album: ${album.name}`);
                        }
                        return {
                            _id: song._id, // Agregar esta línea para incluir el ID de la canción
                            name: song.name,
                            duration: song.duration,
                            image: song.image,
                            url_cancion: song.url_cancion ? song.url_cancion : '',
                            artists: song.idArtist.map(artist => artist.name)
                        };
                    })
                };
            }));
    
            console.log('Álbumes encontrados por popularidad:', responseAlbums);
    
            return {
                message: {
                    description: "Álbumes obtenidos por popularidad correctamente",
                    code: 0
                },
                data: responseAlbums
            };
        } catch (error) {
            console.error('Error en getAlbumsByPopularity:', error);
            return {
                message: {
                    description: 'Error interno del servidor',
                    code: 1
                },
                data: {}
            };
        }
    }
    
    

    async getSongsByGenres(offset = 0, limit = 10) {
        const validGenres = ['Pop', 'Rock', 'Indie', 'Reggaeton', 'Electronica', 'Jazz'];
        const normalizedGenres = validGenres.map(genre => genre.toLowerCase());
    
        // Definir imágenes por género
        const genreImages = {
            'pop': 'https://firebasestorage.googleapis.com/v0/b/spiralmusicapp.appspot.com/o/4720d947a3492adf8963267e5f896ddf.jpg?alt=media&token=a52dbf55-0759-4042-9c26-b032302cdcae',
            'rock': 'https://firebasestorage.googleapis.com/v0/b/spiralmusicapp.appspot.com/o/unnamed.jpg?alt=media&token=4aa47de3-5e3d-4067-a3d1-a701bd01b0c0',
            'reggaeton': 'https://firebasestorage.googleapis.com/v0/b/spiralmusicapp.appspot.com/o/8e5504546937558f711958b221eafb3b7d60be76.jpeg?alt=media&token=62dc74c7-10f4-4778-b926-e651db39d7ee',
            'indie': 'https://firebasestorage.googleapis.com/v0/b/spiralmusicapp.appspot.com/o/652d7ed5bbf4223960b5c92f_What%20is%20Indie%20Music.jpg?alt=media&token=728fbd76-a460-4f94-aa00-b05f09957aa0',
            'jazz': 'https://firebasestorage.googleapis.com/v0/b/spiralmusicapp.appspot.com/o/Louis_Armstrong_NYWTS.jpg?alt=media&token=70bb2de2-1828-4fc1-9334-513a1db85ea1',
            'electronica': 'https://firebasestorage.googleapis.com/v0/b/spiralmusicapp.appspot.com/o/musica-electronica-5.webp?alt=media&token=dcadfa8b-3ca4-4c05-9324-0290f8eb4465'
        };
    
        try {
            const songsByGenre = [];
    
            for (const genre of normalizedGenres) {
                const songs = await Songs.find({ genres: genre })
                    .skip(offset)
                    .limit(limit)
                    .populate('idArtist', 'name')
                    .exec();
    
                songsByGenre.push({
                    name: validGenres[normalizedGenres.indexOf(genre)], // Obtener el nombre del género original
                    image: genreImages[genre], // Asignar la imagen del género
                    songs: songs.map(song => ({
                        _id: song._id,
                        name: song.name,
                        duration: song.duration,
                        image: song.image,
                        artists: song.idArtist.map(artist => artist.name)
                    }))
                });
            }
    
            return {
                message: {
                    code: 0,
                    description: 'Success'
                },
                data: songsByGenre
            };
        } catch (error) {
            console.error('Error fetching songs by genres:', error);
            return {
                message: {
                    code: 1,
                    description: 'Internal Server Error'
                },
                data: null
            };
        }
    }

    async getArtistsByPopularity(offset = 0, limit = 10) {
        try {
            console.log(`Consultando artistas por popularidad en la base de datos local con offset: ${offset}, limit: ${limit}...`);
            
            let artistsFromDB = await Artist.find({})
                .sort({ popularity: -1 })
                .skip(offset)
                .limit(limit)
                .exec();
    
            console.log('Resultado de la consulta:', artistsFromDB);
    
            if (artistsFromDB.length === 0) {
                console.log('Artistas no encontrados');
                return {
                    message: {
                        description: 'No se encontraron artistas por popularidad',
                        code: 3
                    },
                    data: []
                };
            }
    
            // Obtener detalles de canciones por cada artista
            const responseArtists = await Promise.all(artistsFromDB.map(async artist => {
                const songs = await Songs.find({ idArtist: artist._id })
                    .select('name duration image')
                    .exec();

                return {
                    name: artist.name,
                    genres: artist.genres,
                    image: artist.image,
                    popularity: artist.popularity,
                    songs: songs.map(song => ({
                        name: song.name,
                        duration: song.duration,
                        image: song.image
                    }))
                };
            }));
    
            console.log('Artistas encontrados por popularidad:', responseArtists);
    
            return {
                message: {
                    description: "Artistas obtenidos por popularidad correctamente",
                    code: 0
                },
                data: responseArtists
            };
        } catch (error) {
            console.error('Error en getArtistsByPopularity:', error);
            return {
                message: {
                    description: 'Error interno del servidor',
                    code: 1
                },
                data: {}
            };
        }
    }

    async getCombinedResponse(req, res) {
        try {
            const albumOffset = parseInt(req.query.albumOffset) || 0;
            const albumLimit = parseInt(req.query.albumLimit) || 10;
            const genreOffset = parseInt(req.query.genreOffset) || 0;
            const genreLimit = parseInt(req.query.genreLimit) || 10;
            const artistOffset = parseInt(req.query.artistOffset) || 0;
            const artistLimit = parseInt(req.query.artistLimit) || 10;
    
            const albumsResponse = await this.getAlbumsByPopularity(albumOffset, albumLimit);
            const songsResponse = await this.getSongsByGenres(genreOffset, genreLimit);
            const artistsResponse = await this.getArtistsByPopularity(artistOffset, artistLimit);
    
            res.json({
                albums: albumsResponse,
                songs: songsResponse,
                artists: artistsResponse
            });
        } catch (error) {
            console.error('Error en getCombinedResponse:', error);
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

export default AlbumsAndSongsController;
