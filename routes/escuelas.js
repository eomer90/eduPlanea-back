const express = require("express");
const Escuela = require("../models/Escuela");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const escuelasEncontradas = await Escuela.find();

    const mensaje = "Escuelas encontradas con éxito";

    res.status(200).json({
      mensaje,
      escuelasEncontradas,
    });
  } catch (error) {
    const mensaje = "Error al encontrar escuelas";

    res.status(500).json({
      mensaje,
      error,
    });
  }
});

router.get("/nivel/:nivelEducativo", async (req, res) => {
  try {
    const { nivelEducativo } = req.params;

    const escuelasEncontradas = await Escuela.find({
      nivelEducativo,
    });

    const mensaje = "Escuelas encontradas con éxito";

    res.status(200).json({
      mensaje,
      escuelasEncontradas,
    });
  } catch (error) {
    const mensaje = "Error al encontrar escuelas";

    res.status(500).json({
      mensaje,
      error,
    });
  }
});

module.exports = router;
