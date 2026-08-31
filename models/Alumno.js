const mongoose = require("mongoose");

const AlumnoSchema = new mongoose.Schema(
  {
    nombre: String,
    apellidoPaterno: String,
    apellidoMaterno: String,
    grado: String,
    grupo: String,
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

    calificacion: {
      type: Number,
      default: null,
    },
  },
  {
    collection: "alumnos",
  },
);

module.exports = mongoose.model("alumnos", AlumnoSchema);
