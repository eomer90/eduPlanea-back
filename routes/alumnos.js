const express = require("express");
const Alumnos = require("../models/Alumno");
const verificarToken = require("../middleware/auth");

const router = express.Router();

// ==========================================
// OBTENER TODOS LOS ALUMNOS
// ==========================================

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

// ==========================================
// OBTENER ALUMNOS DE UNA CLASE
// ==========================================

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

// ==========================================
// OBTENER UN ALUMNO
// ==========================================

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

// ==========================================
// CREAR ALUMNO
// ==========================================

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

// ==========================================
// REGISTRAR / ACTUALIZAR ASISTENCIAS
// ==========================================

router.patch("/", verificarToken, async (req, res) => {
  try {
    const { fecha, claseId, asistencia } = req.body;

    for (const alumno of asistencia) {
      const alumnoEncontrado = await Alumnos.findOne({
        _id: alumno.id,
        usuarioId: req.usuarioId,
        escuelaId: req.escuelaId,
      });

      if (!alumnoEncontrado) continue;

      const materiaEncontrada = alumnoEncontrado.materias.find(
        (materia) => String(materia.claseId) === String(claseId),
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
    console.log(error);

    res.status(500).json({
      mensaje: "Error al registrar asistencia",
      error,
    });
  }
});

// ==========================================
// EDITAR FECHA DE ASISTENCIA
// ==========================================

router.patch("/asistencias/fecha", verificarToken, async (req, res) => {
  try {
    const { claseId, fechaAnterior, fechaNueva } = req.body;

    if (!claseId || !fechaAnterior || !fechaNueva) {
      return res.status(400).json({
        error: true,
        mensaje: "Faltan datos para actualizar la asistencia",
      });
    }

    const alumnos = await Alumnos.find({
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
      "materias.claseId": claseId,
    });

    let actualizadas = 0;

    for (const alumno of alumnos) {
      const materia = alumno.materias.find(
        (materia) => String(materia.claseId) === String(claseId),
      );

      if (!materia) continue;

      const asistencia = materia.asistencias.find(
        (asistencia) => asistencia.fecha === fechaAnterior,
      );

      if (!asistencia) continue;

      asistencia.fecha = fechaNueva;

      await alumno.save();

      actualizadas++;
    }

    res.status(200).json({
      mensaje: "Fecha de asistencia actualizada con éxito",
      actualizadas,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: true,
      mensaje: "Error al actualizar fecha de asistencia",
      detalle: error.message,
    });
  }
});

// ==========================================
// EDITAR ACTIVIDAD
// ==========================================

router.patch("/actividades", verificarToken, async (req, res) => {
  try {
    const { claseId, tituloAnterior, fechaAnterior, tituloNuevo, fechaNueva } =
      req.body;

    const alumnos = await Alumnos.find({
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
      "materias.claseId": claseId,
    });

    let actualizadas = 0;

    for (const alumno of alumnos) {
      const actividades = alumno.actividades || [];

      let modificada = false;

      for (const actividad of actividades) {
        if (
          actividad.titulo === tituloAnterior &&
          actividad.fecha === fechaAnterior
        ) {
          actividad.titulo = tituloNuevo;
          actividad.fecha = fechaNueva;

          modificada = true;
        }
      }

      if (modificada) {
        await alumno.save();
        actualizadas++;
      }
    }

    res.status(200).json({
      mensaje: "Actividad actualizada con éxito",
      actualizadas,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: true,
      mensaje: "Error al actualizar actividad",
      detalle: error.message,
    });
  }
});

// ==========================================
// ELIMINAR ASISTENCIA
// ==========================================

router.delete("/asistencias", verificarToken, async (req, res) => {
  try {
    const { claseId, fecha } = req.body;

    if (!claseId || !fecha) {
      return res.status(400).json({
        error: true,
        mensaje: "Faltan datos para eliminar la asistencia",
      });
    }

    const alumnos = await Alumnos.find({
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
      "materias.claseId": claseId,
    });

    let eliminadas = 0;

    for (const alumno of alumnos) {
      const materia = alumno.materias.find(
        (materia) => String(materia.claseId) === String(claseId),
      );

      if (!materia) continue;

      const asistenciasAntes = materia.asistencias.length;

      materia.asistencias = materia.asistencias.filter(
        (asistencia) => asistencia.fecha !== fecha,
      );

      if (materia.asistencias.length !== asistenciasAntes) {
        await alumno.save();

        eliminadas++;
      }
    }

    res.status(200).json({
      mensaje: "Asistencia eliminada con éxito",
      eliminadas,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: true,
      mensaje: "Error al eliminar asistencia",
      detalle: error.message,
    });
  }
});

// ==========================================
// ELIMINAR ACTIVIDAD
// ==========================================

router.delete("/actividades", verificarToken, async (req, res) => {
  try {
    const { claseId, titulo, fecha } = req.body;

    const alumnos = await Alumnos.find({
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
      "materias.claseId": claseId,
    });

    let eliminadas = 0;

    for (const alumno of alumnos) {
      const actividades = alumno.actividades || [];

      const actividadesAntes = actividades.length;

      alumno.actividades = actividades.filter(
        (actividad) =>
          !(actividad.titulo === titulo && actividad.fecha === fecha),
      );

      if (alumno.actividades.length !== actividadesAntes) {
        await alumno.save();

        eliminadas++;
      }
    }

    res.status(200).json({
      mensaje: "Actividad eliminada con éxito",
      eliminadas,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: true,
      mensaje: "Error al eliminar actividad",
      detalle: error.message,
    });
  }
});

// ==========================================
// ACTUALIZAR ALUMNO
// ==========================================

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

// ==========================================
// ELIMINAR ALUMNO
// ==========================================

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

    res.status(200).json({
      mensaje: "Alumno eliminado con éxito",
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
