import storage from '../../utils/firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Songs from '../../models/Songs.js';
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import fs from 'fs';
import Artist from '../../models/Artist.js';
import User from '../../models/User.js'; // Asumiendo que tienes un modelo de User

class FirebaseController {
  async uploadSongFile(req, res) {
    const form = formidable({ multiples: false });

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

      console.log('Fields:', fields);
      console.log('Files:', files);

      const { name, genres, duration } = fields;
      const songFile = files.song ? files.song[0] : null;
      const imageFile = files.image ? files.image[0] : null;
      const idUser = req.user._id; // Obtener el id del usuario autenticado

      if (!songFile || !imageFile) {
        return res.status(400).json({
          message: {
            description: 'Files are missing',
            code: 1
          }
        });
      }

      // Verificar y dividir genres si es una cadena de texto
      let parsedGenres;
        parsedGenres = genres.toString().split(',');
      
      // Obtener el idArtist asociado al idUser
      const user = await User.findById(idUser).populate('idArtist');
      if (!user || !user.idArtist) {
        return res.status(404).json({
          message: {
            description: 'Artist not found for this user',
            code: 1
          }
        });
      }
      const idArtist = user.idArtist._id;

      // Generar un nombre de archivo único
      const uniqueFileName = `${uuidv4()}-${songFile.originalFilename}`;
      const uniqueImageFileName = `${uuidv4()}-${imageFile.originalFilename}`;

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

       // Asegurarse de que name y duration sean valores simples
      const songName = Array.isArray(name) ? name[0] : name;
      const songDuration = parseInt(Array.isArray(duration) ? duration[0] : duration, 10);

        // Crear un nuevo documento Songs
        const newSong = new Songs({
          name: songName,
          genres: parsedGenres,
          duration: songDuration,
          image: imageDownloadURL,
          url_cancion: songDownloadURL,
          idArtist: [idArtist],
        });

        // Guardar en la base de datos
        const savedSong = await newSong.save();
        console.log('Song saved successfully to MongoDB:', savedSong);

        // Obtener los detalles completos del artista
        const artistDetails = await Artist.findById(idArtist);
        if (!artistDetails) {
          return res.status(404).json({
            message: {
              description: 'Artist details not found',
              code: 1
            }
          });
        }

        // Añadir los detalles completos del artista a la respuesta
        const response = {
          ...savedSong.toObject(),
          artist: artistDetails.toObject()
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
