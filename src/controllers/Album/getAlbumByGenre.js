import Album from '../../models/Album.js';

class AlbumsGenreController {
    constructor() {
        console.log("Creando instancia de AlbumsGenreController...");
    }

    async getAlbumsByGenre(req, res) {
        console.log("Accediendo a getAlbumsByGenre");
        try {
            const { genre, offset, limit } = req.query;
    
            // Check if genre is provided and convert it to lowercase
            const parsedGenres = genre ? [genre.toLowerCase()] : [];
    
            // Define the limit and skip amount for pagination
            const queryLimit = limit ? parseInt(limit) : 10; // Default to 10 if no limit is provided
            const skipAmount = offset ? parseInt(offset) : 0; // Start from the beginning if no offset is provided
    
            console.log(`Searching for albums by genres: ${parsedGenres}`);
    
            // Perform the database query with populate to get song names and artists
            let albumsFromDB = await Album.find({
                genre: {
                    $in: parsedGenres // Search for albums where one of the genres matches the provided ones
                }
            })
            .skip(skipAmount)
            .limit(queryLimit)
            .populate('idSong', 'name duration image url_cancion')
            .populate('idArtist', 'name genres image popularity')
            .exec();

            console.log('Resultado de la consulta:', albumsFromDB);

            if (albumsFromDB.length === 0) {
                console.log('Álbumes no encontrados');
                return res.json({
                    message: {
                        description: 'No se encontraron álbumes para los géneros especificados',
                        code: 3
                    },
                    data: []
                });
            }

            const responseAlbums = albumsFromDB.map(album => ({
                name: album.name,
                duration: album.idSong.reduce((acc, song) => acc + song.duration, 0) / album.idSong.length,
                genres: album.genres,
                image: album.image,
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

            console.log('Álbumes encontrados:', responseAlbums);

            res.json({
                message: {
                    description: "Álbumes obtenidos correctamente",
                    code: 0
                },
                data: responseAlbums
            });
        } catch (error) {
            console.error('Error en getAlbumsByGenre:', error);
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

export default AlbumsGenreController;
