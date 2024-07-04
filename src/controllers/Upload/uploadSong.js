// FirebaseController.js

import storage from '../../utils/firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Songs from '../../models/Songs.js';
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import fs from 'fs';
import Artist from '../../models/Artist.js';

class FirebaseController {
  async uploadSongFile(req, res) {
    const form = formidable({ multiple: false });

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

      const { name, genres, duration } = fields;
      const songFile = files.song[0];
      const imageFile = files.image[0];
      const idUser = req.user._id; // Obtener el id del usuario autenticado

      // Verificar que genres es un string JSON válido
      let parsedGenres;
      try {
        parsedGenres = JSON.parse(genres);
        if (!Array.isArray(parsedGenres)) {
          throw new Error('Genres is not an array');
        }
      } catch (error) {
        console.error('Invalid genres format:', error);
        return res.status(400).json({
          message: {
            description: 'Invalid genres format',
            code: 1
          }
        });
      }

      // Generar un nombre de archivo único
      const uniqueFileName = `${uuidv4()}-${songFile.originalFilename}`;
      const uniqueImageFileName = `${uuidv4()}-${imageFile.originalFilename}`;
      console.log(files);

      try {
        // Leer el archivo como un buffer
        const fileBuffer = fs.readFileSync(songFile.filepath);
        const imageBuffer = fs.readFileSync(imageFile.filepath);

        // Crear referencias de almacenamiento con metadatos
        const storageRef = ref(storage, `songs/${uniqueFileName}`);
        const imageStorageRef = ref(storage, `images/${uniqueImageFileName}`);

        const songMetadata = {
          contentType: songFile.mimetype,
        };
        const imageMetadata = {
          contentType: imageFile.mimetype,
        };

        const songSnapshot = await uploadBytes(storageRef, fileBuffer, songMetadata);
        const imageSnapshot = await uploadBytes(imageStorageRef, imageBuffer, imageMetadata);

        console.log('File uploaded successfully:', songSnapshot.metadata.fullPath);
        console.log('Image uploaded successfully:', imageSnapshot.metadata.fullPath);

        // Obtener las URLs de descarga
        const songDownloadURL = await getDownloadURL(storageRef);
        const imageDownloadURL = await getDownloadURL(imageStorageRef);
        console.log('Download URL for song:', songDownloadURL);
        console.log('Download URL for image:', imageDownloadURL);

        // Crear un nuevo documento Songs
        const newSong = new Songs({
          name: name[0],
          genres: parsedGenres,
          duration: duration[0],
          image: imageDownloadURL,
          url_cancion: songDownloadURL,
          idArtist: [idUser],
        });

        // Guardar en la base de datos
        const savedSong = await newSong.save();
        console.log('Song saved successfully to MongoDB:', savedSong);

        // Obtener los nombres de los artistas
        const artistDetails = await Artist.find({ _id: { $in: [idUser] } }, 'name');
        const artists = artistDetails.map(artist => ({ id: artist._id, name: artist.name }));

        // Añadir los detalles de los artistas a la respuesta
        const response = {
          ...savedSong.toObject(),
          artists
        };

        res.status(200).json({
          message: {
            description: 'Archivo de canción subido y guardado correctamente',
            code: 0
          },
          data: response
        });
      } catch (error) {
        console.error('Error uploading file or saving to MongoDB:', error);
        res.status(500).json({
          message: {
            description: 'Error uploading file or saving to MongoDB',
            code: 1
          }
        });
      }
    });
  }
}

export default FirebaseController;
