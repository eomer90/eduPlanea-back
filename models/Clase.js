const mongoose = require("mongoose");

const ClasesSchema = new mongoose.Schema(
  {
    nombre: String,
    materia: String,
    grado: String,
    grupo: String,
    salon: String,
    horarios: [
      {
        dia: String,
        inicio: String,
        fin: String,
      },
    ],
    periodoInicio: String,
    periodoFin: String,
    usuarioId: mongoose.Schema.Types.ObjectId,
    escuelaId: mongoose.Schema.Types.ObjectId,
  },
  { collection: "clases" },
);

module.exports = mongoose.model("clases", ClasesSchema);
