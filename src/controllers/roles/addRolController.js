import Rol from '../../models/Rol.js'; // Asegúrate de que la ruta sea correcta 

export const addRol = async (req, res) => {
    try {
        const { idRol, description } = req.body;
        const rol = new Rol({ idRol, description });
        const savedRol = await rol.save();
        res.status(201).json({ message: 'El rol se ha creado correctamente', rol: savedRol });
    } catch (error) {
        // Manejo de errores específicos
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Error de validación', error: error.message });
        } else if (error.code === 11000) {
            res.status(400).json({ message: 'Rol ya existe', error: error.message });
        } else {
            res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }
}