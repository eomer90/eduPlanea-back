const express = require("express");
const Usuario = require("../models/Usuario");
const verificarToken = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const enviarCorreoRecuperacion = require("../services/email");

const router = express.Router();

router.get("/auth/verify", verificarToken, (req, res) => {
  res.status(200).json({
    mensaje: "Token válido",
  });
});

router.post("/", async (req, res) => {
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

router.post("/forgot-password", async (req, res) => {
  try {
    const { correo } = req.body;

    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.status(200).json({
        mensaje:
          "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    usuario.resetPasswordToken = token;
    usuario.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await usuario.save();

    const enlace = `${process.env.FRONTEND_URL}/restablecer-contrasena/${token}`;

    const correoEnviado = await enviarCorreoRecuperacion(
      usuario.correo,
      enlace,
    );

    if (!correoEnviado) {
      return res.status(500).json({
        error: true,
        mensaje: "No fue posible enviar el correo.",
      });
    }

    res.status(200).json({
      mensaje:
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
    });
  } catch (error) {
    console.log("ERROR RECUPERAR CONTRASEÑA:", error);

    res.status(500).json({
      error: true,
      mensaje: "Error al solicitar la recuperación de contraseña.",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    const usuario = await Usuario.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!usuario) {
      return res.status(400).json({
        error: true,
        mensaje: "El enlace de recuperación no es válido o ya expiró.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    usuario.password = passwordHash;
    usuario.resetPasswordToken = null;
    usuario.resetPasswordExpires = null;

    await usuario.save();

    res.status(200).json({
      mensaje: "Contraseña restablecida correctamente.",
    });
  } catch (error) {
    console.log("ERROR RESTABLECER CONTRASEÑA:", error);

    res.status(500).json({
      error: true,
      mensaje: "Error al restablecer la contraseña.",
    });
  }
});

module.exports = router;
