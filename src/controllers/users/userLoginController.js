import User from '../../models/User.js';
import { configDotenv } from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Rol from '../../models/Rol.js';
import Artist from '../../models/Artist.js'; // Importa el modelo Artist

configDotenv();

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password'); // Selecciona la contraseña
    if (!user) {
      return res.status(400).json({
        message: {
          description: 'Credenciales incorrectas',
          code: 1
        }
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: {
          description: 'Credenciales incorrectas',
          code: 1
        }
      });
    }

    const role = await Rol.findOne({ idRol: user.idRol });
    if (!role) {
      return res.status(404).json({
        message: {
          description: 'Rol no encontrado',
          code: 1
        }
      });
    }

    const userRole = user.idRol;

    const token = jwt.sign(
      { id: user._id, idRol: user.idRol }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    const userId = user._id.toString();

    const userData = user.toObject();
    delete userData.password; // Elimina la contraseña del objeto de usuario

    // Buscar la información del artista asociado con el usuario
    let artistData = null;
    if (user.idArtist) {
      const artist = await Artist.findById(user.idArtist);
      if (artist) {
        artistData = artist.toObject();
      } else {
        console.log('Artista no encontrado para este usuario');
      }
    }

    res.json({
      message: {
        description: 'Has iniciado sesión correctamente',
        code: 0
      },
      data: {
        ...userData,
        token,
        Rol: userRole,
        userId,
        artist: artistData // Incluir la información del artista si existe
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: {
        description: 'Error interno del servidor',
        code: 1
      }
    });
  }
};
