import { configDotenv } from "dotenv";

import mongoose from "mongoose";

configDotenv();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 30000, // Aumenta el tiempo de espera a 30 segundos
        serverSelectionTimeoutMS: 30000 // Aumenta el tiempo de selección del servidor a 30 segundos

      });
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error);
    process.exit(1);
  }
};

