const express = require("express");
const Evaluaciones = require("../models/Evaluacion");
const verificarToken = require("../middleware/auth");

const EVALUACIONES_ROUTE = "/evaluaciones";

const router = express.Router();

router.get("/clase/:claseId", verificarToken, async (req, res) => {
  try {
    const evaluacionesEncontradas = await Evaluaciones.find({
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
      claseId: req.params.claseId,
    });
    res.status(200).json({
      mensaje: "Evaluaciones encontradas con éxito",
      evaluacionesEncontradas,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al encontrar evaluaciones",
      error,
    });
  }
});

router.post(EVALUACIONES_ROUTE, verificarToken, async (req, res) => {
  try {
    const data = {
      ...req.body,
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    };
    const nuevaEvaluacion = await Evaluaciones.create(data);
    res.status(201).json({
      mensaje: "Evaluación guardada correctamente",
      nuevaEvaluacion,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: "Error al guardar la evaluación",
    });
  }
});

router.patch(EVALUACIONES_ROUTE, verificarToken, async (req, res) => {
  try {
    const { _id, ...data } = req.body;

    const evaluacionActualizada = await Evaluaciones.findByIdAndUpdate(
      _id,
      data,
      {
        new: true,
      },
    );
    const mensaje = "Evaluacion actualiazada con éxito";
    res.status(200).json({ mensaje, evaluacionActualizada });
  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: "Error al Actualizar la evaluación",
    });
  }
});

router.delete(EVALUACIONES_ROUTE, verificarToken, async (req, res) => {
  try {
    const id = req.body._id;
    const evaluacionEliminada = await Evaluaciones.findByIdAndDelete(id);
    const mensaje = "Evaluación eliminada con éxito";
    res.status(200).json({ mensaje, evaluacionEliminada });
  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: "Error al eliminar la evaluación",
    });
  }
});

module.exports = router;
