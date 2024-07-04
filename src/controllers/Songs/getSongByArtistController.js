import Spotify from '../../components/Spotify.js';
import Songs from '../../models/Songs.js';
import Artist from '../../models/Artist.js';

class SongsByArtistController {
    constructor() {
        console.log("Creating Spotify instance...");
        this.spotify = new Spotify();
        console.log("Spotify instance created:", this.spotify);
    }

    async getSongsByArtist(req, res) {
        console.log("Accessing getSongsByArtist, Spotify is:", this.spotify);
        try {
            const { name, offset } = req.query;
            const limit = 10; // Total limit of songs to return
            const skipAmount = offset ? parseInt(offset) : 0; // Number of songs to skip

            // Adjust the regex to match songs that start with the specified name
            let regex = new RegExp("^" + name, "i");

            // Fetch songs from the database
            let dbSongs = await Songs.find({ name: { $regex: regex } }).skip(skipAmount).limit(limit);
            console.log("Primary songs:", dbSongs.length);

            // Check if additional songs are needed from Spotify
            let spotifySongs = [];
            if (dbSongs.length < limit) {
                console.log("Making request to Spotify API for additional songs...");
                const spotifyResponse = await this.spotify.getTracks({
                    by: 'artist',
                    param: name,
                    limit: limit - dbSongs.length, // Request only the remaining number of songs to complete the limit
                    offset: skipAmount,
                });

                console.log("Spotify API response:", spotifyResponse);

                if (spotifyResponse.error) {
                    console.error('Error fetching songs from Spotify:', spotifyResponse.error);
                    return res.status(500).json({ message: 'Failed to fetch songs from Spotify', error: spotifyResponse.error });
                }

                if (!spotifyResponse || !Array.isArray(spotifyResponse)) {
                    console.error('Unexpected response from Spotify:', spotifyResponse);
                    return res.status(500).json({ message: 'Failed to fetch songs from Spotify' });
                } else {
                    console.log("Processing songs data from Spotify...");
                    for (const artistData of spotifyResponse) {
                        const artistName = artistData.name;
                        const tracks = artistData.tracks || [];

                        let existingArtist = await Artist.findOne({ name: artistName });
                        if (!existingArtist) {
                            existingArtist = new Artist({
                                name: artistName,
                                genres: artistData.genres || [], // Use an empty array if genres are not available
                                image: artistData.image || '', // Use a default empty string if image is not available
                                popularity: artistData.popularity || 0 // Use a default value if popularity is not available
                            });
                            await existingArtist.save(); // Save the new artist to the database
                        }

                        for (const track of tracks) {
                            let existingSong = await Songs.findOne({
                                name: track.name,
                                'idArtist': existingArtist._id
                            });

                            if (!existingSong) {
                                const songDoc = new Songs({
                                    name: track.name,
                                    genres: artistData.genres || [], // Use an empty array if genres are not available
                                    duration: track.duration_ms || 0, // Use a default value if duration is not available
                                    image: track.album?.images?.[0]?.url || '', // Safely access the image URL
                                    url_cancion: track.external_urls?.spotify || '', // Use a default value if URL is not available
                                    idArtist: existingArtist._id
                                });
                                await songDoc.save();
                            }
                        }
                    }

                    // Reload the newly added songs from the database
                    spotifySongs = await Songs.find({ name: { $regex: regex } }).skip(skipAmount).limit(limit - dbSongs.length);
                }
            }

            // Combine the results and ensure the total count is not more than 10
            const allSongs = dbSongs.concat(spotifySongs).slice(0, limit);

            // Finally, return all the found or added songs
            return res.json({ Songs: allSongs });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default SongsByArtistController;
