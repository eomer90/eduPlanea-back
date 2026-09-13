const express = require("express");
const Recordatorio = require("../models/Recordatorio");

const router = express.Router();

router.get("/", verificarToken, async (req, res) => {
  try {
    const recordatoriosEncontrados = await Recordatorio.find({
      usuarioId: req.usuarioId,
    });

    const mensaje = "Recordatorios encontrados con éxito";

    res.status(200).json({
      mensaje,
      recordatoriosEncontrados,
    });
  } catch (error) {
    const mensaje = "Error al encontrar recordatorios";

    res.status(500).json({
      error,
      mensaje,
    });
  }
});

router.post("/", verificarToken, async (req, res) => {
  try {
    const data = {
      ...req.body,
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    };

    const recordatorioGuardado = await Recordatorio.create(data);

    const mensaje = "Recordatorio guardado con éxito";

    res.status(201).json({
      mensaje,
      recordatorioGuardado,
    });
  } catch (error) {
    const mensaje = "Error al guardar el recordatorio";

    res.status(500).json({
      error,
      mensaje,
    });
  }
});

router.patch("/:id", verificarToken, async (req, res) => {
  try {
    const recordatorioActualizado = await Recordatorio.findOneAndUpdate(
      {
        _id: req.params.id,
        usuarioId: req.usuarioId,
        escuelaId: req.escuelaId,
      },
      req.body,
      { new: true },
    );

    if (!recordatorioActualizado) {
      return res.status(404).json({
        mensaje: "Recordatorio no encontrado",
      });
    }

    res.status(200).json({
      mensaje: "Recordatorio actualizado con éxito",
      recordatorioActualizado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar el recordatorio",
      error,
    });
  }
});

router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const recordatorioEliminado = await Recordatorio.findOneAndDelete({
      _id: req.params.id,
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    });

    if (!recordatorioEliminado) {
      return res.status(404).json({
        mensaje: "Recordatorio no encontrado",
      });
    }

    res.status(200).json({
      mensaje: "Recordatorio eliminado con éxito",
      recordatorioEliminado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar el recordatorio",
      error,
    });
  }
});
