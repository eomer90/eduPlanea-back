const express = require("express");
const Clases = require("../models/Clase");
const Alumnos = require("../models/Alumno");
const Evaluacion = require("../models/Evaluacion");
const verificarToken = require("../middleware/auth");

const router = express.Router();

// ==========================================
// OBTENER TODAS LAS CLASES
// ==========================================

router.get("/", verificarToken, async (req, res) => {
  try {
    const clases = await Clases.find({
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    });

    const mensaje = "Clases encontradas con éxito";

    res.status(200).json({
      mensaje,
      clases,
    });
  } catch (error) {
    const mensaje = "Error al encontrar clases";

    res.status(500).json({
      error,
      mensaje,
    });
  }
});

// ==========================================
// OBTENER UNA CLASE
// ==========================================

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

    res.status(200).json({
      mensaje,
      claseEncontrada,
    });
  } catch (error) {
    const mensaje = "Error al encontrar clase";

    res.status(500).json({
      mensaje,
      error,
    });
  }
});

// ==========================================
// CREAR CLASE
// ==========================================

router.post("/", verificarToken, async (req, res) => {
  try {
    const data = {
      ...req.body,
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    };

    const nuevaClase = await Clases.create(data);

    const mensaje = "Nueva clase creada con éxito";

    res.status(201).json({
      mensaje,
      nuevaClase,
    });
  } catch (error) {
    const mensaje = "Error al crear nueva clase";

    res.status(500).json({
      error,
      mensaje,
    });
  }
});

// ==========================================
// EDITAR CLASE
// ==========================================

router.patch("/:id", verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    // Actualizar la clase
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

    // ==========================================
    // ACTUALIZAR INFORMACIÓN EN LOS ALUMNOS
    // ==========================================

    const alumnos = await Alumnos.find({
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
      "materias.claseId": id,
    });

    for (const alumno of alumnos) {
      const materia = alumno.materias.find(
        (materia) => String(materia.claseId) === String(id),
      );

      if (!materia) continue;

      // Actualizamos únicamente la información
      // de la clase dentro del alumno.

      materia.nombre = claseActualizada.materia;
      materia.grado = claseActualizada.grado;
      materia.grupo = claseActualizada.grupo;

      await alumno.save();
    }

    const mensaje = "Clase actualizada con éxito";

    res.status(200).json({
      mensaje,
      claseActualizada,
    });
  } catch (error) {
    console.log(error);

    const mensaje = "Error al actualizar clase";

    res.status(500).json({
      mensaje,
      error,
    });
  }
});

// ==========================================
// ELIMINAR CLASE
// ==========================================

router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const id = req.params.id;

    // ==========================================
    // 1. ELIMINAR LA CLASE
    // ==========================================

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

    // ==========================================
    // 2. LIMPIAR LA CLASE DE LOS ALUMNOS
    // ==========================================

    const alumnos = await Alumnos.find({
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    });

    for (const alumno of alumnos) {
      // Eliminar la materia de esa clase.
      // Al eliminar la materia también se eliminan
      // las asistencias que estaban dentro de ella.

      alumno.materias = (alumno.materias || []).filter(
        (materia) => String(materia.claseId) !== String(id),
      );

      // Eliminar las actividades de esa clase.

      alumno.actividades = (alumno.actividades || []).filter(
        (actividad) => String(actividad.claseId) !== String(id),
      );

      await alumno.save();
    }

    // ==========================================
    // 3. ELIMINAR EVALUACIONES DE LA CLASE
    // ==========================================

    await Evaluacion.deleteMany({
      claseId: id,
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    });

    // ==========================================
    // RESPUESTA
    // ==========================================

    const mensaje = "Clase eliminada con éxito";

    res.status(200).json({
      mensaje,
      claseEliminada,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      mensaje: "Error al eliminar clase",
      error,
    });
  }
});

module.exports = router;
