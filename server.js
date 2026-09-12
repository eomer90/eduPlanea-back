const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const verificarToken = require("./middleware/auth");

const server = express();
server.use(express.json());
server.use(cors());

const PORT = process.env.PORT || 3000;

const RECORDATORIOS_ROUTE = "/recordatorios";
const Recordatorio = require("./models/Recordatorio");

const clasesRoutes = require("./routes/clases");
const alumnosRoutes = require("./routes/alumnos");
const evaluacionesRoutes = require("./routes/evaluaciones");
const loginRoutes = require("./routes/login");
const registroRoutes = require("./routes/registros");
const escuelasRoutes = require("./routes/escuelas");
const usuariosRoutes = require("./routes/usuarios");

server.use("/clases", clasesRoutes);
server.use("/alumnos", alumnosRoutes);
server.use("/evaluaciones", evaluacionesRoutes);
server.use("/login", loginRoutes);
server.use("/registro", registroRoutes);
server.use("/escuelas", escuelasRoutes);
server.use("/usuarios", usuariosRoutes);

server.get("/auth/verify", verificarToken, (req, res) => {
  res.status(200).json({
    mensaje: "Token válido",
  });
});

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
