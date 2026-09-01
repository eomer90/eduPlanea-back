const mongoose = require("mongoose");

const AlumnoSchema = new mongoose.Schema(
  {
    nombre: String,
    apellidoPaterno: String,
    apellidoMaterno: String,
    grado: String,
    grupo: String,

    materias: [
      {
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

        evaluaciones: [
          {
            tipoEvaluacion: String,
            resultado: String,
          },
        ],

        calificaciones: String,
      },
    ],
  },
  {
    collection: "alumnos",
  },
);

module.exports = mongoose.model("alumnos", AlumnoSchema);
