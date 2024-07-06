// src/controllers/PlaylistController.js
import Playlist from '../../models/Playlist.js';

class PlaylistGetController {
  async getUserPlaylists(req, res) {
    try {
      const userId = req.user._id; // Obtén el ID del usuario autenticado desde req.user

      const playlists = await Playlist.find({ userId }).populate('idSong');

      return res.status(200).json({
        message: {
          description: 'Playlists retrieved successfully',
          code: 0
        },
        data: playlists
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: {
          description: 'Internal server error',
          code: 1
        },
        data: null
      });
    }
  }
}

export default new PlaylistGetController();
