// FirebaseController.js

import storage from '../../utils/firebaseConfig.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Songs from '../../models/Songs.js'; // Ajusta la ruta según donde tengas definido tu modelo Songs
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import fs from 'fs';
import Artist from '../../models/Artist.js'; // Asegúrate de ajustar la ruta según donde tengas definido tu modelo Artist

class FirebaseController {
  async uploadSongFile(req, res) {
    const form = formidable({ multiple: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).send('Error parsing form data');
      }

      const { name, genres, duration, idArtist } = fields;
      const songFile = files.song[0];
      const imageFile = files.image[0];

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
          genres: genres, // Asegúrate de que genres sea un array, aquí se asume que se envía como stringified JSON
          duration: duration[0],
          image: imageDownloadURL, // URL de la imagen desde Firebase
          url_cancion: songDownloadURL, //URL de la cancion desde Firebase
          idArtist: idArtist.map(id => id), // Utiliza el map para manejar múltiples artistas
        });

        // Guardar en la base de datos
        const savedSong = await newSong.save();
        console.log('Song saved successfully to MongoDB:', savedSong);

        // Obtener los nombres de los artistas
        const artistDetails = await Artist.find({ _id: { $in: idArtist } }, 'name');
        const artists = artistDetails.map(artist => ({ id: artist._id, name: artist.name }));

        // Añadir los detalles de los artistas a la respuesta
        const response = {
          ...savedSong.toObject(),
          artists
        };

        return res.status(200).json(response);
      } catch (error) {
        console.error('Error uploading file or saving to MongoDB:', error);
        return res.status(500).send('Error uploading file or saving to MongoDB');
      }
    });
  }
}




export default FirebaseController;
