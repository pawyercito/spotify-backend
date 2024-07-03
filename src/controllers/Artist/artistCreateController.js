import storage from '../../utils/firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import fs from 'fs';
import mongoose from 'mongoose'; // Importar mongoose para manejar errores
import Artist from '../../models/Artist.js'; // Asegúrate de ajustar la ruta según donde tengas definido tu modelo Artist

export const createArtist = async (req, res) => {
  const form = formidable({ multiples: true }); // Permitir múltiples archivos y campos

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({
        message: {
          description: 'Error parsing form data',
          code: 1
        }
      });
    }

    console.log('Received fields:', fields); // Agregar este console.log para verificar los campos recibidos

    let { name, genres, popularity } = fields;
    const imageFile = files.image ? files.image[0] : null;

    // Generar un nombre de archivo único para la imagen
    const uniqueImageFileName = imageFile ? `${uuidv4()}-${imageFile.originalFilename}` : null;

    // Asegurarse de que genres sea un array de strings
// Asegurarse de que genres sea un array de strings
    const genresString = fields.genres && Array.isArray(fields.genres) ? JSON.stringify(fields.genres) : '';  
      
    const genresArray = genresString.split(',').map(genre => genre.trim());

    // Convertir name y popularity a los tipos correctos si son arrays
    if (Array.isArray(name)) {
      name = name[0];
    }
    if (Array.isArray(popularity)) {
      popularity = popularity[0];
    }

    try {
      let imageDownloadURL = '';

      if (imageFile) {
        // Leer el archivo de imagen como un buffer
        const imageBuffer = fs.readFileSync(imageFile.filepath);

        // Crear referencia de almacenamiento con metadatos
        const imageStorageRef = ref(storage, `artists/${uniqueImageFileName}`);

        const imageMetadata = {
          contentType: imageFile.mimetype,
        };

        // Subir la imagen a Firebase Storage
        const imageSnapshot = await uploadBytes(imageStorageRef, imageBuffer, imageMetadata);
        console.log('Image uploaded successfully:', imageSnapshot.metadata.fullPath);

        // Obtener la URL de descarga de la imagen
        imageDownloadURL = await getDownloadURL(imageStorageRef);
        console.log('Download URL for image:', imageDownloadURL);
      }

      // Crear un nuevo objeto Artist con los datos recibidos y la URL de la imagen
      const newArtist = new Artist({
        name: String(name), // Convertir a string
        genres: genresArray, // Usar el array de géneros
        image: imageDownloadURL, // URL de la imagen desde Firebase
        popularity: Number(popularity) // Convertir a número
      });

      // Guardar el nuevo artista en la base de datos
      const savedArtist = await newArtist.save();
      console.log('Artist saved successfully to MongoDB:', savedArtist);

      // Enviar una respuesta exitosa con el artista creado
      res.status(201).json({
        message: {
          description: 'Artista creado correctamente',
          code: 0
        },
        data: {
          artist: savedArtist
        }
      });
    } catch (error) {
      console.error('Error uploading file or saving to MongoDB:', error);
      if (error instanceof mongoose.Error) {
        // Error de validación de Mongoose
        res.status(400).json({
          message: {
            description: 'Error al crear el artista',
            code: 1
          },
          error: error.message
        });
      } else {
        // Otros errores
        res.status(500).json({
          message: {
            description: 'Error interno del servidor',
            code: 1
          },
          error: error.message
        });
      }
    }
  });
};
