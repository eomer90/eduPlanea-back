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
const ESCUELAS_ROUTE = "/escuelas";
const RECORDATORIOS_ROUTE = "/recordatorios";
const Clases = require("./models/Clase");
const Escuela = require("./models/Escuela");
const Usuario = require("./models/Usuario");
const Recordatorio = require("./models/Recordatorio");

const alumnosRoutes = require("./routes/alumnos");
const evaluacionesRoutes = require("./routes/evaluaciones");

server.use("/alumnos", alumnosRoutes);
server.use("/evaluaciones", evaluacionesRoutes);

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
