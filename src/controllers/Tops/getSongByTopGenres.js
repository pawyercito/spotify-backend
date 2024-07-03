// controllers/SongsController.js
import Songs from '../../models/Songs.js';

class SongsTopGenreController {
  async getSongsByGenre(req, res) {
    const genre = req.query.genre?.trim();
    console.log('Genre received:', genre);

    const validGenres = ['Pop', 'Rock', 'Indie', 'Reggeaton', 'Electronica', 'Jazz'];
    const normalizedGenre = genre?.toLowerCase();

    const validGenresNormalized = validGenres.map(g => g.toLowerCase());

    if (!genre || !validGenresNormalized.includes(normalizedGenre)) {
      console.log('Invalid genre:', genre);
      return res.status(400).json({
        message: {
          code: 1,
          description: 'Invalid genre. Valid options are: Pop, Rock, Indie, Reggeaton, Electronica, Jazz.'
        },
        data: null
      });
    }

    try {
      // Ajustamos la consulta para buscar todos los documentos donde el array 'genres' contenga el género específico
      const songs = await Songs.find({ genres: normalizedGenre }).populate('idArtist', 'name');
      console.log('Songs found:', songs);
      
      return res.status(200).json({
        message: {
          code: 0,
          description: 'Success'
        },
        data: songs
      });
    } catch (error) {
      console.error('Error fetching songs by genre:', error);
      return res.status(500).json({
        message: {
          code: 1,
          description: 'Internal Server Error'
        },
        data: null
      });
    }
  }
}

export default SongsTopGenreController;
