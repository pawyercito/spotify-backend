import express from "express";
const router = express.Router()
import {addRol} from '../controllers/roles/addRolController.js';

// Añadir Rol

router.post('/add-rol', addRol);


export default router