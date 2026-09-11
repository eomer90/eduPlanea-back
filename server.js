const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verificarToken = require("./middleware/auth");

const server = express();
server.use(express.json());
server.use(cors());

const PORT = process.env.PORT || 3000;
const CLASES_ROUTE = "/clases";
const ALUMNOS_ROUTE = "/alumnos";
const ESCUELAS_ROUTE = "/escuelas";
const EVALUACIONES_ROUTE = "/evaluaciones";
const RECORDATORIOS_ROUTE = "/recordatorios";
const Clases = require("./models/Clase");
const Alumnos = require("./models/Alumno");
const Escuela = require("./models/Escuela");
const Usuario = require("./models/Usuario");
const Evaluacion = require("./models/Evaluacion");
const Recordatorio = require("./models/Recordatorio");

const levantarServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    server.listen(PORT, () => {
      console.log(`Server connected to port ${PORT}`);
    });
    console.log("MongoDb connected");
    console.log("Base de datos:", mongoose.connection.name);
  } catch (error) {
    console.log(error, "Error connecting MongoDb");
  }
};

levantarServer();

//clases

server.get(CLASES_ROUTE, verificarToken, async (req, res) => {
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

server.get(`${CLASES_ROUTE}/:id`, verificarToken, async (req, res) => {
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

server.post(CLASES_ROUTE, verificarToken, async (req, res) => {
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

server.patch(`${CLASES_ROUTE}/:id`, verificarToken, async (req, res) => {
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

server.delete(`${CLASES_ROUTE}/:id`, verificarToken, async (req, res) => {
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

//alumnos

server.get(ALUMNOS_ROUTE, verificarToken, async (req, res) => {
  try {
    const alumnos = await Alumnos.find({
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    });

    const mensaje = "Alumnos encontrados con éxito";

    res.status(200).json({ mensaje, alumnos });
  } catch (error) {
    const mensaje = "Error al encontrar alumnos";

    res.status(500).json({ mensaje, error });
  }
});

server.get(`${ALUMNOS_ROUTE}/:id`, verificarToken, async (req, res) => {
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

    res.status(200).json({ mensaje, alumnoEncontrado });
  } catch (error) {
    const mensaje = "Error al encontrar alumno";

    res.status(500).json({ mensaje, error });
  }
});

server.post(ALUMNOS_ROUTE, verificarToken, async (req, res) => {
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
        (materia) => materia.claseId.toString() === nuevaMateria.claseId,
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

server.patch(ALUMNOS_ROUTE, verificarToken, async (req, res) => {
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

server.patch(`${ALUMNOS_ROUTE}/:id`, verificarToken, async (req, res) => {
  console.log("🔥 PATCH ALUMNO EJECUTADO");

  try {
    const id = req.params.id;
    const datos = req.body;

    console.log("ID:", id);
    console.log("NOMBRE RECIBIDO:", datos.nombre);

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

    console.log("NOMBRE DESPUÉS DE ACTUALIZAR:", alumnoActualizado?.nombre);

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

server.delete(`${ALUMNOS_ROUTE}/:id`, verificarToken, async (req, res) => {
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

//registro

server.post("/registro", async (req, res) => {
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

//login

server.get("/auth/verify", verificarToken, (req, res) => {
  res.status(200).json({
    mensaje: "Token válido",
  });
});

server.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const usuario = await Usuario.findOne({ username });
    if (!usuario) {
      return res.status(401).json({
        error: true,
        mensaje: "Usuario o contraseña incorrectos",
      });
    }
    const passwordCorrecta = await bcrypt.compare(password, usuario.password);
    if (!passwordCorrecta) {
      return res.status(401).json({
        error: true,
        mensaje: "Usuario o contraseña incorrectos",
      });
    }
    const token = jwt.sign(
      {
        usuarioId: usuario._id,
        escuelaId: usuario.escuelaId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        username: usuario.username,
        admin: usuario.admin,
        escuelaId: usuario.escuelaId,
      },
    });
  } catch (error) {
    console.log("ERROR LOGIN:", error);

    res.status(500).json({
      error: true,
      mensaje: "Error al iniciar sesión",
    });
  }
});

//escuelas

server.get(ESCUELAS_ROUTE, async (req, res) => {
  try {
    const escuelasEncontradas = await Escuela.find();
    const mensaje = "Escuelas encontradas con éxito";
    res.status(200).json({ mensaje, escuelasEncontradas });
  } catch (error) {
    const mensaje = "Error al encontrar escuelas";
    res.status(500).json({ mensaje, error });
  }
});

// evaluaciones

server.get(EVALUACIONES_ROUTE, verificarToken, async (req, res) => {
  try {
    const evaluacionesEncontradas = await Evaluacion.find();
    const mensaje = "Evaluaciones encontradas con éxito";
    res.status(200).json({ mensaje, evaluacionesEncontradas });
  } catch (error) {
    const mensaje = "Error al encontrar evaluaciones";
    res.status(500).json({ mensaje, error });
  }
});

server.post(EVALUACIONES_ROUTE, verificarToken, async (req, res) => {
  try {
    const data = {
      ...req.body,
      usuarioId: req.usuarioId,
      escuelaId: req.escuelaId,
    };
    const nuevaEvaluacion = await Evaluacion.create(data);
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

server.patch(EVALUACIONES_ROUTE, verificarToken, async (req, res) => {
  try {
    const { _id, ...data } = req.body;

    const evaluacionActualizada = await Evaluacion.findByIdAndUpdate(
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

server.delete(EVALUACIONES_ROUTE, verificarToken, async (req, res) => {
  try {
    const id = req.body._id;
    const evaluacionEliminada = await Evaluacion.findByIdAndDelete(id);
    const mensaje = "Evaluación eliminada con éxito";
    res.status(200).json({ mensaje, evaluacionEliminada });
  } catch (error) {
    res.status(500).json({
      error: true,
      mensaje: "Error al eliminar la evaluación",
    });
  }
});

//recordatorios

server.get(RECORDATORIOS_ROUTE, verificarToken, async (req, res) => {
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

server.post(RECORDATORIOS_ROUTE, verificarToken, async (req, res) => {
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

server.patch(`${RECORDATORIOS_ROUTE}/:id`, verificarToken, async (req, res) => {
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

server.delete(
  `${RECORDATORIOS_ROUTE}/:id`,
  verificarToken,
  async (req, res) => {
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
  },
);
