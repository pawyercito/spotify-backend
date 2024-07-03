import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Rol from './Rol.js'; // Asegúrate de que esta ruta sea correcta

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    bio: String,
    website: String,
    location: String,
  },
  idRol: { type: mongoose.Schema.Types.String, required: true, ref: 'Rol' },
  idArtist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
  playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }], // Campo agregado para almacenar las referencias a las playlists

});

UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10); // Usa 10 rondas de hash
  }
  next();
});

UserSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v; // Elimina el campo __v si está presente
    delete returnedObject.password; // Elimina la contraseña
  },
});

const User = mongoose.model('User', UserSchema);
export default User;