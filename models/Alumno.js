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
            nombre: String,
            fecha: String,
            instrumento: String,
            cuantitativa: Boolean,
            cualitativa: Boolean,
            contenidoId: String,
            pdaIds: [String],

            resultados: [
              {
                alumnoId: String,
                calificacion: String,
                nivelDesempeno: String,
                observaciones: String,

                manifestaciones: [
                  {
                    pdaId: String,
                    manifestacion: String,
                  },
                ],
              },
            ],
          },
        ],
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
