// Importar el modelo Playlist
import Playlist from '../../models/Playlist.js';
import Songs from '../../models/Songs.js';
import Artist from '../../models/Artist.js';

// Función para crear una nueva playlist
export const createPlaylist = async (req, res) => {
  try {
      const { name, image, idSong } = req.body;

      if (!name ||!image ||!Array.isArray(idSong)) {
        return res.status(400).json({ message: 'Faltan datos necesarios para crear la playlist.' });
    }

      // Asegúrate de que el userId del usuario autenticado esté presente en el cuerpo de la solicitud
      const userId = req.user._id; // Aquí asumimos que el objeto req.user tiene un campo _id que contiene el ID del usuario

      // Crear una nueva instancia de Playlist
      const playlist = new Playlist({
          userId, // Incluir el userId en la playlist
          name,
          image,
          idSong,
      });

      // Guardar la nueva playlist en la base de datos
      const savedPlaylist = await playlist.save();

      // Usar populate para obtener el nombre de la canción y, si es posible, el nombre del artista
      const populatedPlaylist = await Playlist.findById(savedPlaylist._id)
       .populate({
              path: 'idSong',
              populate: {
                  path: 'idArtist',
                  model: 'Artist'
              }
          });

      // Preparar la respuesta
      const response = {
          message: {
              code: 0,
              description: 'Playlist creada correctamente'
          },
          data: {
              playlist: {
                  _id: populatedPlaylist._id,
                  name: populatedPlaylist.name,
                  image: populatedPlaylist.image,
                  userId: userId, // Incluir el userId en la respuesta
                  songs: populatedPlaylist.idSong.map(song => ({
                      name: song.name,
                      artistName: song.idArtist? song.idArtist.name : 'Artista no disponible'
                  }))
              }
          }
      };

      res.status(201).json(response);
  } catch (error) {
      console.error(error);
      res.status(500).json({
          message: 'Error interno del servidor',
          error: error.message,
      });
  }
};