const express = require("express");
const Clases = require("../models/Clase");
const verificarToken = require("../middleware/auth");

const router = express.Router();

router.get("/", verificarToken, async (req, res) => {
  try {
    const clases = await Clases.find({
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    });
    const mensaje = "Clases encontradas con éxito";
    res.status(200).json({ mensaje, clases });
  } catch (error) {
    const mensaje = "Error al encontrar clases";
    res.status(500).json({ error, mensaje });
  }
});

router.get("/:id", verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const claseEncontrada = await Clases.findOne({
      _id: id,
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    });
    if (!claseEncontrada) {
      return res.status(404).json({
        error: true,
        mensaje: "Clase no encontrada",
      });
    }
    const mensaje = "Clase encontrada con éxito";
    res.status(200).json({ mensaje, claseEncontrada });
  } catch (error) {
    const mensaje = "Error al encontrar clase";
    res.status(500).json({ mensaje, error });
  }
});

router.post("/", verificarToken, async (req, res) => {
  try {
    const data = {
      ...req.body,
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    };
    const nuevaClase = await Clases.create(data);
    const mensaje = "Nueva clase creada con éxito";
    res.status(201).json({ mensaje, nuevaClase });
  } catch (error) {
    const mensaje = "Error al crear nueva clase";
    res.status(500).json({ error, mensaje });
  }
});

router.patch("/:id", verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const claseActualizada = await Clases.findOneAndUpdate(
      {
        _id: id,
        usuarioId: req.usuarioId,
        escuelaId: req.escuelaId,
      },
      data,
      {
        new: true,
      },
    );
    if (!claseActualizada) {
      return res.status(404).json({
        error: true,
        mensaje: "Clase no encontrada",
      });
    }
    const mensaje = "Clase actualizada con éxito";
    res.status(200).json({ mensaje, claseActualizada });
  } catch (error) {
    const mensaje = "Error al actualizar clase";
    res.status(500).json({ error, mensaje });
  }
});

router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const claseEliminada = await Clases.findOneAndDelete({
      _id: id,
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    });
    if (!claseEliminada) {
      return res.status(404).json({
        error: true,
        mensaje: "Clase no encontrada",
      });
    }
    const mensaje = "Clase eliminada con éxito";
    res.status(200).json({
      mensaje,
      claseEliminada,
    });
  } catch (error) {
    const mensaje = "Error al eliminar clase";
    res.status(500).json({
      mensaje,
      error,
    });
  }
});

module.exports = router;
