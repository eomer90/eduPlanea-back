const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const verificarToken = require("./middleware/auth");

const server = express();
server.use(express.json());
server.use(cors());

const PORT = process.env.PORT || 3000;

const clasesRoutes = require("./routes/clases");
const alumnosRoutes = require("./routes/alumnos");
const evaluacionesRoutes = require("./routes/evaluaciones");
const loginRoutes = require("./routes/login");
const registroRoutes = require("./routes/registros");
const escuelasRoutes = require("./routes/escuelas");
const usuariosRoutes = require("./routes/usuarios");
const recordatoriosRoutes = require("./routes/recordatorios");

server.use("/clases", clasesRoutes);
server.use("/alumnos", alumnosRoutes);
server.use("/evaluaciones", evaluacionesRoutes);
server.use("/login", loginRoutes);
server.use("/registro", registroRoutes);
server.use("/escuelas", escuelasRoutes);
server.use("/usuarios", usuariosRoutes);
server.use("/recordatorios", recordatoriosRoutes);

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
