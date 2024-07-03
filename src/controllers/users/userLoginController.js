import User from '../../models/User.js'; // Asegúrate de que la ruta sea correcta
import { configDotenv } from "dotenv";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Rol from '../../models/Rol.js';

configDotenv();

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: {
          description: 'Credenciales incorrectas',
          code: 1 // Ajustado al valor permitido
        }
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: {
          description: 'Credenciales incorrectas',
          code: 1 // Ajustado al valor permitido
        }
      });
    }

    // Buscar el rol basado en el idRol del usuario
    const role = await Rol.findOne({ idRol: user.idRol });
    if (!role) {
      return res.status(404).json({
        message: {
          description: 'Rol no encontrado',
          code: 1 // Ajustado al valor permitido
        }
      });
    }

    const roleDescription = role ? role.description : 'Rol no asignado';

    const token = jwt.sign(
      { id: user._id, roleDescription }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Convertir el _id del usuario a string para enviarlo en la respuesta
    const userId = user._id.toString();

    res.json({
      message: {
        description: 'Has iniciado sesión correctamente',
        code: 0 // Ajustado al valor permitido
      },
      data: {
        token,
        roleDescription,
        userId // Incluir el userId en la respuesta
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: {
        description: 'Error interno del servidor',
        code: 1 // Ajustado al valor permitido
      }
    });
  }
};
