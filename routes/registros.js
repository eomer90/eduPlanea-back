const express = require("express");
const Usuario = require("../models/Usuario");
const Escuela = require("../models/Escuela");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      nombreEscuela,
      nivelEducativo,
      nombreUsuario,
      correo,
      username,
      password,
    } = req.body;

    const nuevaEscuela = await Escuela.create({
      nombre: nombreEscuela,
      nivelEducativo,
    });

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      nombre: nombreUsuario,
      correo,
      username,
      password: passwordHash,
      admin: true,
      escuelaId: nuevaEscuela._id,
    });

    res.status(201).json({
      mensaje: "Registro realizado con éxito",
      escuela: nuevaEscuela,
      usuario: nuevoUsuario,
    });
  } catch (error) {
    res.status(500).json({
      error,
      mensaje: "Error al realizar el registro",
    });
  }
});

router.post("/usuario", async (req, res) => {
  try {
    const { nombreUsuario, correo, username, password, escuelaId } = req.body;

    const escuela = await Escuela.findById(escuelaId);

    if (!escuela) {
      return res.status(404).json({
        error: true,
        mensaje: "La escuela seleccionada no existe.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      nombre: nombreUsuario,
      correo,
      username,
      password: passwordHash,
      admin: false,
      escuelaId: escuela._id,
    });

    res.status(201).json({
      mensaje: "Usuario registrado con éxito",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.log("ERROR REGISTRO USUARIO:", error);

    res.status(500).json({
      error: true,
      mensaje: "Error al registrar usuario",
    });
  }
});

module.exports = router;
