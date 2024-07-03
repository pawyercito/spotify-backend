import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
    idRol: { type: String, required: true, unique: true },
    description: { type: String, required: true },
  });

  export default mongoose.model('Rol', RoleSchema);
  
