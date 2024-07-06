import Songs from "../../models/Songs.js";
import Artist from "../../models/Artist.js";

class SongsController {
  async getSongsByName(req, res) {
    try {
      const { name, offset = 0 } = req.query;
      const limit = 10;

      // Buscar canciones en la base de datos que coincidan con el nombre
      let songs = await Songs.find({});

      // Filtrar canciones por nombre usando una expresión regular
      const regex = new RegExp(name, "gi"); // 'i' para ignorar mayúsculas y minúsculas, 'g' para búsqueda global
      const regex2 = new RegExp(name.substring(0, 2), "gi");
      let songs2 = songs.filter((song) => regex.test(song.name));

      if (songs2.length === 0) {
        songs2 = songs.filter((song) => regex2.test(song.name));
      }

      const currentUser = req.user;

      // Transformar la lista de canciones para ajustar el formato de artistas
      const transformedSongs = await Promise.all(
        songs2.map(async (song) => {
          const {
            _id,
            name,
            duration,
            genres,
            image,
            url_cancion,
            idArtist,
            likes,
            likedBy,
            __v,
          } = song.toObject();
          const artists = await Promise.all(
            idArtist.map(async (artistId) => {
              const artist = await Artist.findById(artistId);
              return { id: artist._id, name: artist.name };
            })
          );
          return {
            _id,
            name,
            duration,
            genres,
            image,
            url_cancion,
            likes: likes || 0,
            likedBy,
            __v,
            artists,
            isLiked: currentUser
              ? song.likedBy.includes(currentUser._id.toString())
              : false,
          };
        })
      );

      return res.json({
        message: { description: "Operación exitosa", code: 0 },
        data: { Songs: transformedSongs },
      });
    } catch (error) {
      console.error("Error en getSongsByName:", error);
      return res.status(500).json({
        message: { description: "Error interno del servidor", code: 1 },
        data: {},
      });
    }
  }
}

export default SongsController;
