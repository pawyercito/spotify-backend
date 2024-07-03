import Songs from '../../models/Songs.js';

async function getSongById(req, res) {
    const {id} = req.params;

    // Limpiar el id eliminando caracteres no deseados
    const cleanedId = id.replace(/\n/g, ''); // Elimina los caracteres '\n'

    try { 
        const song = await Songs.findById(cleanedId)
        .populate('idArtist')
        .select('-idArtist');
        if (!song) {
            return res.status(404).json({
                message: {
                    description: 'Canción no encontrada',
                    code: 1 // Indicamos un error al no encontrar la canción
                },
                data: {} // La descripción está vacía porque no hay datos para mostrar
            });
        }

        const { name, duration, genres, image, url_cancion, idArtist } = song;
        
        // Construye un array de nombres de artistas a partir de las referencias pobladas
        const ArtistNames = idArtist.map(artistRef => artistRef.name);

        // Preparar la descripción con los datos de la canción
        const data = {
            name,
            duration,
            genres,
            image,
            url_cancion,
            Artist: ArtistNames // Usa directamente el array de nombres de artistas
        };

        res.json({
            message: {
                description: 'Se obtuvo la canción correctamente',
                code: 0 // Indicamos éxito al encontrar y obtener la canción
            },
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: {
                description: 'Error interno del servidor',
                code: 1 // Indicamos un error en el proceso
            },
            data: {} // La descripción está vacía porque hubo un error
        });
    }
}

export default getSongById;