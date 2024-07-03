import Album from '../../models/Album.js';

class AlbumsGenreController {
    constructor() {
        // Puedes inicializar cualquier cosa que necesites aquí
    }

    async getAlbumsByGenre(req, res) {
        const { genre } = req.params;
    
        if (!genre) {
            console.error('El género es requerido');
            return res.status(400).json({
                message: {
                    description: 'El género es requerido',
                    code: 2
                },
                data: {}
            });
        }
    
        console.log(`Buscando álbumes por género: ${genre}`);
    
        try {
            console.log('Consultando álbumes en la base de datos local...');
            let albumsFromDB = await Album.find({
                genre: genre // Busca documentos donde el campo `genre` contenga el valor de `genre`
            })
               .populate('idSong', 'name duration image')
               .populate('idArtist', 'name genres image popularity')
               .exec();
    
            console.log('Resultado de la consulta:', albumsFromDB);
    
            if (albumsFromDB.length === 0) {
                console.log('Álbumes no encontrados');
                return res.json({
                    message: {
                        description: 'No se encontraron álbumes para el género especificado',
                        code: 3
                    },
                    data: []
                });
            }
    
            const responseAlbums = albumsFromDB.map(album => ({
                name: album.name,
                duration: album.idSong.reduce((acc, song) => acc + song.duration, 0) / album.idSong.length,
                genres: album.genre,
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
