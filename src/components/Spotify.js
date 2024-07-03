"use strict";
import { apiFetch } from "../services/apiFetch.js";

class Spotify {
  constructor() {}

  //Obtener canciones por id, por nombre y por artist
  getTracks = async ({ by, param, limit = 10, offset = 0 }) => {
    const byFormatted = by.toLowerCase();

    const option = {
      name: { type: "search", search: "track" },
      artist: { type: "search", search: "artist" },
      id: { type: "tracks" },
    };

    const result = await this.#useApiFetch({
      by: byFormatted,
      limit,
      offset,
      options: option,
      param: param,
    });
    try {
      let theTracks = [];

      if (byFormatted === "name") {
        const arrayTracks = result["tracks"]["items"];

        const tracks = await this.#getTracksParsed({
          prop: arrayTracks,
        });

        theTracks = tracks;
      } else if (byFormatted === "id") {
        const track = await this.#getTracksParsed({ prop: result });

        theTracks.push(track[0]);
      } else if (byFormatted === "artist") {
        const arrayArtist = result["artists"]["items"];

        const artistParsed = await this.#getArtistParsed({
          prop: arrayArtist,
          isComplete: true,
        });

        for (let i in artistParsed) {
          const tracksByArtist = await this.#getTracksByArtist({
            idArtist: artistParsed[i].id,
            genres: artistParsed.genres,
          });

          theTracks.push({ ...artistParsed[i], tracks: tracksByArtist });
        }
      }

      return theTracks.length > 1 ? theTracks : theTracks[0];
    } catch (error) {
      console.log(`Hubo un error al obtener canciones ${error}`);
      return { error: error.message };
    }
  };

  //Obtener albums por id o por nombre
  getAlbums = async ({ by, param, limit = 10, offset = 0 }) => {
    const byFormatted = by.toLowerCase();

    const option = {
      name: { type: "search", search: "album" },
      id: { type: "albums", search: "tracks" },
    };

    const result = await this.#useApiFetch({
      by: byFormatted,
      limit,
      offset,
      options: option,
      param,
    });
    try {
      let albums = [];
      if (byFormatted === "name") {
        const arrayAlbums = result["albums"]["items"];

        for (const album of arrayAlbums) {
          // Obtener artistas del álbum
          const artistsAlbum = await this.#getArtistParsed({
            prop: album.artists,
          });

          //*Obtengo las tracks del Album y el genero correspondiente para cada cancion
          const { tracks, genres } = await this.#getGenres({
            id: album.id,
            arrayArtist: artistsAlbum,
          });

          //* Parsea tracks del album
          const arrayTracks = await this.#getTracksParsed({
            prop: tracks,
            genres,
            imageUrl: album.images[0].url,
          });

          const obj = {
            id: album.id,
            name: album.name,
            image: album.images[0].url,
            artists: artistsAlbum,
            genre: genres,
            tracks: arrayTracks,
            type: album.album_type,
          };

          albums.push(obj);
        }
      } else if (byFormatted === "id") {
        //*Obtener artistas del album
        const artistsAlbum = await this.#getArtistParsed({
          prop: result.artists,
        });

        const { tracks, genres } = await this.#getGenres({
          album: result,
          arrayArtist: artistsAlbum,
        });

        const arrayTracks = await this.#getTracksParsed({
          prop: tracks,
          genres,
          imageUrl: result.images[2].url,
        });

        const obj = {
          id: result.id,
          name: result.name,
          image: result.images[2].url,
          artists: artistsAlbum,
          genre: genres,
          tracks: arrayTracks,
        };

        albums.push(obj);
      }
      console.log(albums); // Agregar esta línea
      return albums.length > 1 ? albums : albums[0];
    } catch (error) {
      console.log(`Hubo un error al obtener albums ${error}`);
      return { error: error.message };
    }
  };

  #useApiFetch = async ({ by, param, options, limit, offset }) => {
    const byFormatted = by.toLowerCase();
    console.log(`byFormatted: ${byFormatted}`); // 2. Imprime `byFormatted` para verificar su valor
    const obj = {
      name: {
        type: options["name"]?.type, // Usa el operador opcional para evitar errores si options["name"] es undefined
        option: { type: options["name"]?.search, limit, offset },
      },
      id: {
        type: options["id"]?.type, // Usa el operador opcional para evitar errores si options["id"] es undefined
        option: { type: options["id"]?.search },
      },
      artist: {
        type: options["artist"]?.type,
        option: { type: options["artist"]?.search, limit, offset },
      },
    };

    if (!obj[byFormatted]) return false;

    const used = obj[byFormatted];

    try {
      const result = await apiFetch({
        type: used["type"],
        option: typeof used["option"]!== "object"? used["option"] : undefined,
        body:
          byFormatted === "id"? { id: param } : { param,...used["option"] },
      });

      return result;
    } catch (error) {
      console.log(`Hubo un error al usar el apiFetch ${error}`);
      return false;
    }
};

  #getArtistParsed = async ({ prop, isComplete }) => {
    const arrayArtistPromises = prop.map(async (artist) => {
      let result;
      if (!isComplete) {
        result = await apiFetch({
          type: "artist",
          body: { id: artist.id },
        });
      }

      return {
        id: artist.id,
        name: artist.name,
        genres: !isComplete ? result.genres : artist.genres,
        popularity: !isComplete ? result.popularity : artist.popularity,
        image: !isComplete ? result.images[0]?.url : artist.images[0].url,
      };
    });
    const arrayArtist = await Promise.all(arrayArtistPromises);

    return arrayArtist;
  };

  #getTracksParsed = async ({ prop, genres, imageUrl }) => {
    const arrayProp = Array.isArray(prop) ? prop : [prop];

    const arrayTracksPromises = arrayProp.map(async (track) => {
      const artistTracks = await this.#getArtistParsed({ prop: track.artists });
      return {
        id: track.id,
        duration: track.duration_ms / 60000,
        url_track: track.preview_url,
        name: track.name,
        artists: artistTracks,
        image: !imageUrl ? track?.album?.images[0].url : imageUrl,
        genres: !genres
          ? artistTracks.reduce((acc, artist) => [...acc, ...artist.genres], [])
          : genres,
      };
    });

    const arrayTracks = await Promise.all(arrayTracksPromises);

    return arrayTracks;
  };

  #getGenres = async ({ id = false, album = false, arrayArtist }) => {
    try {
      let albumComplete = !id
        ? album
        : await apiFetch({ type: "albums", body: { id } });

      const tracks = albumComplete["tracks"]["items"];

      let genres =
        albumComplete["genres"]?.length > 0
          ? albumComplete["genres"]
          : arrayArtist.reduce((acc, artist) => [...acc, ...artist.genres], []);

      return { tracks, genres };
    } catch (error) {
      console.log(`Hubo un error al obtener los generos ${error.message}`);
      return new Error("Genero no encontrado");
    }
  };

  #getTracksByArtist = async ({ idArtist, genres }) => {
    const objectAlbums = await apiFetch({
      type: "artist",
      option: "albums",
      body: { id: idArtist },
    });

    const albums = objectAlbums["items"];

    const tracksAlbumsPromises = (Array.isArray(albums) ? albums : null)?.map(
      async (album) => {
        const result = await apiFetch({
          type: "albums",
          body: { id: album.id },
        });

        const tracks = result["tracks"]["items"];

        return await this.#getTracksParsed({
          prop: tracks,
          imageUrl: result.images[0].url,
          genres: result.genres.length > 0 ? result.genres : genres,
        });
      }
    );

    const [tracksAlbums] = await Promise.all(tracksAlbumsPromises);

    return tracksAlbums;
  };
}

export default Spotify;
