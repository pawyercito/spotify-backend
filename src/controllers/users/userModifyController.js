import User from '../../models/User.js';

export const modify = async (req, res) => {
  try {
    const { bio, website, location, username, email, password } = req.body;
    // Verifica que req.user.id esté definido
    if (!req.user.id) return res.status(401).json({ msg: 'No autorizado' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    // Actualiza los campos del perfil solo si están presentes en la solicitud
    if (bio !== undefined) user.profile.bio = bio;
    if (website !== undefined) user.profile.website = website;
    if (location !== undefined) user.profile.location = location;
    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;

    // Si se proporciona una nueva contraseña, actualizarla
    if (password) {
      user.password = password; // Asigna la nueva contraseña directamente
    }

    await user.save(); // Guarda el usuario. El middleware pre('save') se encargará del hash

    // Envía un mensaje de éxito
    res.json({
      message: {
        description: 'Perfil modificado correctamente',
        code: 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { description: 'Error interno del servidor', code: 1 } });
  }
};
