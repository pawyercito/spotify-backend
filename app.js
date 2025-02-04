import express from "express";
import { configDotenv } from "dotenv";
import { connectDB } from "./db.js";
import userRoutes from "./src/routes/users.js";
import rolRoutes from "./src/routes/rol.js";
import artistRoutes from "./src/routes/artist.js";
import playlistRoutes from "./src/routes/playlist.js";
import songsRoutes from "./src/routes/songs.js";
import albumsRoutes from "./src/routes/album.js";
import firebaseRoutes from "./src/routes/firebase.js";
import genresRoutes from "./src/routes/genres.js";
import likeRoutes from "./src/routes/like.js";
import cors from "cors"; // Importa el paquete cors

connectDB();

configDotenv();
const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors()); // Configura CORS
app.use(express.json());

app.use("/api/likes", likeRoutes);
app.use("/api/genres", genresRoutes);
app.use("/api/firebase", firebaseRoutes);
app.use("/api/songs", songsRoutes);
app.use("/api/rol", rolRoutes);
app.use("/api/artist", artistRoutes);
app.use("/api/playlist", playlistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/albums", albumsRoutes);


app.get("/", (req, res) => {
  res.json({ message: "Hola bebe" });
});

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT} on http://127.0.0.1:${PORT}`);
});
