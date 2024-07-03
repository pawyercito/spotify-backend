import User from '../../models/User.js';
import Playlist from '../../models/Playlist.js';

export const register = async (req, res) => {
  try {
    const { username, email, password, idRol } = req.body;

    const validRoles = ["1", "2"];
    if (!validRoles.includes(idRol)) {
      return res.status(400).json({
        message: {
          description: 'Rol inválido. Los roles válidos son "1" para Artista y "2" para Usuario.',
          code: 1 // Cambiado a un número
        }
      });
    }

    const user = new User({ username, email, password, idRol });
    const savedUser = await user.save();

    const favoritePlaylist = new Playlist({
      userId: savedUser._id,
      name: "Favoritos",
      image: "",
      isFavorite: true,
    });
    const savedPlaylist = await favoritePlaylist.save();

    // Ahora que el modelo User tiene un campo playlists, podemos añadir la playlist "Favoritos" a este campo.
    savedUser.playlists.push(savedPlaylist._id);
    await savedUser.save();

    // Preparando la respuesta con el mensaje, descripción y datos requeridos
    const responseMessage = {
      message: {
        description: 'Usuario creado correctamente',
        code: 0 // Cambiado a un número
      },
      data: {
        user: {
          ...savedUser.toJSON(), // Asegúrate de que esto convierte el documento Mongoose a un objeto simple
          playlists: [{
            id: savedPlaylist._id,
            name: savedPlaylist.name,
            userId: savedPlaylist.userId,
            isFavorite: savedPlaylist.isFavorite,
          }]
        }
      },
    };

    res.json(responseMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        description: 'Error interno del servidor',
        code: 1 // Cambiado a un número
      }
    });
  }
};
