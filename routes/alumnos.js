const express = require("express");
const Alumnos = require("../models/Alumno");
const verificarToken = require("../middleware/auth");

const router = express.Router();

router.get("/", verificarToken, async (req, res) => {
  try {
    const alumnos = await Alumnos.find({
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    });
    const mensaje = "Alumnos encontrados con éxito";
    res.status(200).json({
      mensaje,
      alumnos,
    });
  } catch (error) {
    const mensaje = "Error al encontrar alumnos";
    res.status(500).json({
      mensaje,
      error,
    });
  }
});

router.get("/clase/:claseId", verificarToken, async (req, res) => {
  try {
    const alumnos = await Alumnos.find({
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
      "materias.claseId": req.params.claseId,
    });
    const mensaje = "Alumnos encontrados con éxito";
    res.status(200).json({
      mensaje,
      alumnos,
    });
  } catch (error) {
    const mensaje = "Error al encontrar alumnos";
    res.status(500).json({
      mensaje,
      error,
    });
  }
});

router.get("/:id", verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const alumnoEncontrado = await Alumnos.findOne({
      _id: id,
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    });
    if (!alumnoEncontrado) {
      return res.status(404).json({
        error: true,
        mensaje: "Alumno no encontrado",
      });
    }
    const mensaje = "Alumno encontrado con éxito";
    res.status(200).json({
      mensaje,
      alumnoEncontrado,
    });
  } catch (error) {
    const mensaje = "Error al encontrar alumno";
    res.status(500).json({
      mensaje,
      error,
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
    const alumnoExistente = await Alumnos.findOne({
      nombre: req.body.nombre,
      apellidoPaterno: req.body.apellidoPaterno,
      apellidoMaterno: req.body.apellidoMaterno,
      escuelaId: req.escuelaId,
    });
    if (alumnoExistente) {
      const nuevaMateria = req.body.materias[0];
      const yaTieneClase = alumnoExistente.materias.some(
        (materia) => String(materia.claseId) === String(nuevaMateria.claseId),
      );
      if (yaTieneClase) {
        return res.status(200).json({
          mensaje: "El alumno ya está inscrito en esta clase",
          alumno: alumnoExistente,
        });
      }
      alumnoExistente.materias.push(nuevaMateria);
      await alumnoExistente.save();
      return res.status(200).json({
        mensaje: "Clase agregada al alumno",
        alumno: alumnoExistente,
      });
    }

    const nuevoAlumno = await Alumnos.create(data);
    res.status(201).json({
      mensaje: "Nuevo alumno creado con éxito",
      nuevoAlumno,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
      mensaje: "Error al crear nuevo alumno",
    });
  }
});

router.patch("/", verificarToken, async (req, res) => {
  try {
    const { fecha, materia, asistencia } = req.body;
    for (const alumno of asistencia) {
      const alumnoEncontrado = await Alumnos.findOne({
        _id: alumno.id,
        usuarioId: req.usuarioId,
        escuelaId: req.escuelaId,
      });
      if (!alumnoEncontrado) continue;
      const materiaEncontrada = alumnoEncontrado.materias.find(
        (mat) => mat.nombre === materia,
      );
      if (!materiaEncontrada) continue;
      const asistenciaExistente = materiaEncontrada.asistencias.find(
        (asis) => asis.fecha === fecha,
      );
      if (asistenciaExistente) {
        asistenciaExistente.estado = alumno.estado;
        asistenciaExistente.observaciones = alumno.observaciones;
      } else {
        materiaEncontrada.asistencias.push({
          fecha,
          estado: alumno.estado,
          observaciones: alumno.observaciones,
        });
      }
      await alumnoEncontrado.save();
    }
    res.status(200).json({
      mensaje: "Asistencia registrada con éxito",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al registrar asistencia",
      error,
    });
  }
});

router.patch("/:id", verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;
    if (datos.materias) {
      datos.materias = datos.materias.map((materia) => ({
        ...materia,
        asistencias: (materia.asistencias || []).filter(
          (asistencia) => asistencia.fecha !== "",
        ),
      }));
    }
    const alumnoActualizado = await Alumnos.findOneAndUpdate(
      {
        _id: id,
        usuarioId: req.usuarioId,
        escuelaId: req.escuelaId,
      },
      {
        $set: datos,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
    if (!alumnoActualizado) {
      return res.status(404).json({
        error: true,
        mensaje: "Alumno no encontrado",
      });
    }
    res.status(200).json({
      mensaje: "Alumno actualizado con éxito",
      alumnoActualizado,
    });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({
      mensaje: "Error al actualizar alumno",
      error,
    });
  }
});

router.delete("/:id", verificarToken, async (req, res) => {
  try {
    const id = req.params.id;
    const alumnoEliminado = await Alumnos.findOneAndDelete({
      _id: id,
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    });
    if (!alumnoEliminado) {
      return res.status(404).json({
        error: true,
        mensaje: "Alumno no encontrado",
      });
    }
    const mensaje = "Alumno eliminado con éxito";
    res.status(200).json({
      mensaje,
      alumnoEliminado,
    });
  } catch (error) {
    const mensaje = "Error al eliminar alumno";
    res.status(500).json({
      mensaje,
      error,
    });
  }
});

module.exports = router;
