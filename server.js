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
    const { fecha, asistencia } = req.body;

    for (const alumno of asistencia) {
      const alumnoEncontrado = await Alumnos.findById(alumno.id);

      if (!alumnoEncontrado) {
        continue;
      }

      const asistenciaExistente = alumnoEncontrado.asistencias.find(
        (asis) => asis.fecha === fecha,
      );

      if (asistenciaExistente) {
        asistenciaExistente.estado = alumno.estado;
        asistenciaExistente.observaciones = alumno.observaciones;
      } else {
        alumnoEncontrado.asistencias.push({
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
