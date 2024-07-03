import Artist from '../../models/Artist.js';

export const createArtist = async (req, res) => {
    try {
        // Extraer información del cuerpo de la solicitud
        const { name, genre, image, popularity } = req.body;

        // Crear un nuevo objeto Artist con los datos recibidos
        const newArtist = new Artist({
            name,
            genre,
            image,
            popularity,
        });

        // Guardar el nuevo artista en la base de datos
        const savedArtist = await newArtist.save();

        // Enviar una respuesta exitosa con el artista creado
        res.status(201).json({
            message: 'Artista creado correctamente',
            artist: savedArtist,
        });
    } catch (error) {
        // Manejo de errores
        console.error(error);
        if (error instanceof mongoose.Error) {
            // Error de validación de Mongoose
            res.status(400).json({
                message: 'Error al crear el artista',
                error: error.message,
            });
        } else {
            // Otros errores
            res.status(500).json({
                message: 'Error interno del servidor',
                error: error.message,
            });
        }
    }
};