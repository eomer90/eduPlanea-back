const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const server = express();
server.use(express.json());
server.use(cors());

const PORT = process.env.PORT || 3000;
const CLASES_ROUTE = "/clases";
const ALUMNOS_ROUTE = "/alumnos";
const Clases = require("./models/Clase");
const Alumnos = require("./models/Alumno");

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

server.get(CLASES_ROUTE, async (req, res) => {
  try {
    const clases = await Clases.find();
    const mensaje = "Clases encontradas con éxito";
    res.status(200).json({ mensaje, clases });
  } catch (error) {
    const mensaje = "Error al encontrar clases";
    res.status(500).json({ error, mensaje });
  }
});

server.get(`${CLASES_ROUTE}/:id`, async (req, res) => {
  try {
    const id = req.params.id;
    const claseEncontrada = await Clases.findById(id);
    const mensaje = "Clase encontrada con éxito";
    res.status(200).json({ mensaje, claseEncontrada });
  } catch (error) {
    const mensaje = "Error al encontrar clase";
    res.status(500).json({ mensaje, error });
  }
});

server.post(CLASES_ROUTE, async (req, res) => {
  try {
    const data = req.body;
    const nuevaClase = await Clases.create(data);
    const mensaje = "Nueva clase creada con éxito";
    res.status(201).json({ mensaje, nuevaClase });
  } catch (error) {
    const mensaje = "Error al crear nueva clase";
    res.status(500).json({ error, mensaje });
  }
});

server.patch(`${CLASES_ROUTE}/:id`, async (req, res) => {
  try {
    const data = req.body;
    const id = req.params.id;
    const claseActualizada = await Clases.findByIdAndUpdate(id, data, {
      new: true,
    });
    const mensaje = "Clase actualizada con éxito";
    res.status(200).json({ mensaje, claseActualizada });
  } catch (error) {
    const mensaje = "Error al actualizar clase";
    res.status(500).json({ error, mensaje });
  }
});

//alumnos

server.get(ALUMNOS_ROUTE, async (req, res) => {
  try {
    const alumnos = await Alumnos.find();
    const mensaje = "Alumnos encontrados con éxito";
    res.status(200).json({ mensaje, alumnos });
  } catch (error) {
    const mensaje = "Error al encontrar alumnos";
    res.status(500).json({ mensaje, error });
  }
});

server.get(`${ALUMNOS_ROUTE}/:id`, async (req, res) => {
  try {
    const id = req.params.id;
    const alumnoEncontrado = await Alumnos.findById(id);
    const mensaje = "Alumno encontrado con éxito";
    res.status(200).json({ mensaje, alumnoEncontrado });
  } catch (error) {
    const mensaje = "Error al encontrar alumno";
    res.status(500).json({ mensaje, error });
  }
});

server.post(ALUMNOS_ROUTE, async (req, res) => {
  try {
    const data = req.body;
    const nuevoAlumno = await Alumnos.create(data);
    const mensaje = "Nuevo alumno creado con éxito";
    res.status(201).json({ mensaje, nuevoAlumno });
  } catch (error) {
    const mensaje = "Error al crear nuevo alumno";
    res.status(500).json({ error, mensaje });
  }
});

server.patch(ALUMNOS_ROUTE, async (req, res) => {
  try {
    const { fecha, materia, asistencia } = req.body;
    for (const alumno of asistencia) {
      const alumnoEncontrado = await Alumnos.findById(alumno.id);
      if (!alumnoEncontrado) {
        continue;
      }
      const materiaEncontrada = alumnoEncontrado.materias.find(
        (mat) => mat.nombre === materia,
      );
      if (!materiaEncontrada) {
        continue;
      }
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

server.patch(`${ALUMNOS_ROUTE}/:id`, async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;

    datos.materias = datos.materias.map((materia) => ({
      ...materia,
      asistencias: materia.asistencias.filter(
        (asistencia) => asistencia.fecha !== "",
      ),
    }));

    const alumnoActualizado = await Alumnos.findByIdAndUpdate(id, datos, {
      new: true,
    });

    const mensaje = "Alumno actualizado con éxito";

    res.status(200).json({ mensaje, alumnoActualizado });
  } catch (error) {
    const mensaje = "Error al actualizar alumno";

    res.status(500).json({ mensaje, error });
  }
});

server.delete(`${ALUMNOS_ROUTE}/:id`, async (req, res) => {
  try {
    const id = req.params.id;
    const alumnoEliminado = await Alumnos.findByIdAndDelete(id);
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
