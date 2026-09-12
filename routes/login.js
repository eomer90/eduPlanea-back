const express = require("express");
const Usuario = require("./models/Usuario");
const verificarToken = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();

router.get("/auth/verify", verificarToken, (req, res) => {
  res.status(200).json({
    mensaje: "Token válido",
  });
});

router.post("/login", async (req, res) => {
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

module.exports = router;
