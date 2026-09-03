const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: true,
        mensaje: "No autorizado",
      });
    }

    const token = authHeader.split(" ")[1];

    const datos = jwt.verify(token, process.env.JWT_SECRET);

    req.usuarioId = datos.usuarioId;
    req.escuelaId = datos.escuelaId;

    next();
  } catch (error) {
    res.status(401).json({
      error: true,
      mensaje: "Token inválido o expirado",
    });
  }
};

module.exports = verificarToken;
