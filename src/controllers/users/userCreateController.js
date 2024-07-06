import User from '../../models/User.js';
import Playlist from '../../models/Playlist.js';

export const register = async (req, res) => {
  try {
    const { username, email, password, idRol, idArtist } = req.body;

    const validRoles = ["1", "2"];
    if (!validRoles.includes(idRol)) {
      return res.status(400).json({
        message: {
          description: 'Rol inválido. Los roles válidos son "1" para Artista y "2" para Usuario.',
          code: 1
        }
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ $or: [{ username }, { email }]});
    if (existingUser) {
      return res.status(409).json({
        message: {
          description: 'El usuario ya existe. Por favor, utiliza otro nombre de usuario o correo electrónico.',
          code: 1 // Código personalizado para indicar duplicidad
        }
      });
    }

    const user = new User({ username, email, password, idRol, idArtist });
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
        code: 0
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
        },
        artist: {
          idArtist: idArtist
        }
      },
    };

    res.json(responseMessage);
  } catch (error) {
    console.error(error);
    if (error.code === 11000 || error.code === 11001) { // Código de error para duplicados en MongoDB
      return res.status(409).json({
        message: {
          description: 'El usuario ya existe. Por favor, utiliza otro nombre de usuario o correo electrónico.',
          code: 2 // Código personalizado para indicar duplicidad
        }
      });
    }
    res.status(500).json({
      message: {
        description: 'Error interno del servidor',
        code: 1
      }
    });
  }
};