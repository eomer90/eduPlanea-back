const express = require("express");
const Usuario = require("../models/Usuario");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const usuariosEncontrados = await Usuario.find();
    const mensaje = "Usuarios encontrados con éxito";
    res.status(200).json({ mensaje, usuariosEncontrados });
  } catch (error) {
    const mensaje = "Error al encontrar usuarios";
    res.status(500).json({ mensaje, error });
  }
});

module.exports = router;
