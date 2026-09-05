const mongoose = require("mongoose");

const EvaluacionSchema = new mongoose.Schema(
  {
    nombre: String,
    fecha: String,
    materia: String,
    instrumento: String,
    cuantitativa: Boolean,
    cualitativa: Boolean,
    contenidoId: String,
    pdaIds: [String],
    resultados: [
      {
        alumnoId: mongoose.Schema.Types.ObjectId,
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

    usuarioId: mongoose.Schema.Types.ObjectId,
    escuelaId: mongoose.Schema.Types.ObjectId,
    claseId: mongoose.Schema.Types.ObjectId,
  },
  {
    collection: "evaluaciones",
  },
);

module.exports = mongoose.model("evaluaciones", EvaluacionSchema);
