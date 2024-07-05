import User from '../../models/User.js';

export const modify = async (req, res) => {
  try {
    const { password } = req.body;
    // Verifica que req.user.id esté definido
    if (!req.user.id) return res.status(401).json({ msg: 'No autorizado' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    // Si se proporciona una nueva contraseña, actualizarla
    if (password) {
      user.password = password; // Asigna la nueva contraseña directamente
    }

    await user.save(); // Guarda el usuario. El middleware pre('save') se encargará del hash

    // Envía un mensaje de éxito
    res.json({ msg: 'Perfil modificado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};