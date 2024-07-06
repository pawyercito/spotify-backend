import Playlist from "../../models/Playlist.js";

export const modifyPlaylist = async (req, res) => {
  try {
    const { idPlaylist, idSong } = req.body;

    const playlist = await Playlist.findById(idPlaylist);
    if (!playlist) {
      return res.status(404).json({
        message: { code: 404, description: "Playlist no encontrada" },
      });
    }
    if (playlist.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: {
          code: 403,
          description:
            "Acceso denegado: No tienes permiso para modificar esta playlist.",
        },
      });
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      idPlaylist,
      { $push: { idSong: idSong } },
      { new: true }
    );

    if (!updatedPlaylist) {
      return res.status(404).json({
        message: {
          code: 404,
          description: "No se pudo actualizar la playlist",
        },
      });
    }

    const response = {
      message: {
        code: 200,
        description: "Canción agregada a la playlist correctamente",
      },
      data: {
        playlist: updatedPlaylist,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: { code: 500, description: "Error interno del servidor" },
      error: error.message,
    });
  }
};
