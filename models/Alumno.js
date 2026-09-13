const mongoose = require("mongoose");

const AlumnoSchema = new mongoose.Schema(
  {
    nombre: String,
    apellidoPaterno: String,
    apellidoMaterno: String,
    grado: String,
    grupo: String,
    observacionesGenerales: String,
    materias: [
      {
        claseId: mongoose.Schema.Types.ObjectId,
        nombre: String,
        asistencias: [
          {
            fecha: String,
            estado: {
              type: String,
              enum: ["presente", "falta", "retardo", "justificado"],
            },
            observaciones: String,
          },
        ],
      },
    ],
    actividades: [
      {
        claseId: mongoose.Schema.Types.ObjectId,
        titulo: String,
        fecha: String,
        estado: {
          type: String,
          enum: ["Pendiente", "Entregado", "No entregado"],
        },
        observaciones: String,
      },
    ],
    usuarioId: mongoose.Schema.Types.ObjectId,
    escuelaId: mongoose.Schema.Types.ObjectId,
  },
  {
    collection: "alumnos",
  },
);

module.exports = mongoose.model("alumnos", AlumnoSchema);
