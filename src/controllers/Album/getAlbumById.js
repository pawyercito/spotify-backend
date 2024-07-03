import Album from '../../models/Album.js';

class AlbumsIdController {
    constructor() {
        // Puedes inicializar cualquier cosa que necesites aquí
    }

    async getAlbumById(req, res) {
        const { idAlbum } = req.params;

        if (!idAlbum) {
            console.error('El ID del álbum es requerido');
            return res.status(400).json({
                message: {
                    description: 'El ID del álbum es requerido',
                    code: 2
                },
                data: {}
            });
        }

        console.log(`Buscando álbum por ID: ${idAlbum}`);

        try {
            console.log('Consultando álbum en la base de datos local...');
            let albumFromDB = await Album.findOne({ idAlbum })
                .populate('idSong', 'name duration image') // Populando canciones
                .populate('idArtist', 'name genres image popularity') // Populando artistas
                .exec();

            if (!albumFromDB) {
                console.error('Álbum no encontrado');
                return res.status(404).json({
                    message: {
                        description: 'Álbum no encontrado',
                        code: 3
                    },
                    data: {}
                });
            }

            const responseAlbum = {
                name: albumFromDB.name,
                duration: albumFromDB.idSong.reduce((acc, song) => acc + song.duration, 0) / albumFromDB.idSong.length,
                genres: albumFromDB.genre || [],
                image: albumFromDB.image,
                artists: albumFromDB.idArtist.map(artist => ({
                    name: artist.name,
                    genres: artist.genres,
                    image: artist.image,
                    popularity: artist.popularity
                })),
                songs: albumFromDB.idSong.map(song => ({
                    name: song.name,
                    duration: song.duration,
                    image: song.image,
                    url_cancion: song.url_cancion
                }))
            };

            console.log('Álbum encontrado:', responseAlbum);

            res.json({
                message: {
                    description: "Álbum obtenido correctamente",
                    code: 0
                },
                data: responseAlbum
            });
        } catch (error) {
            console.error('Error en getAlbumById:', error);
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

export default AlbumsIdController;
