const mongoose = require("mongoose");

const ClasesSchema = new mongoose.Schema(
  {
    nombre: String,
    materia: String,
    grado: String,
    grupo: String,
    horarios: [
      {
        dia: String,
        inicio: String,
        fin: String,
      },
    ],
    periodoInicio: String,
    periodoFin: String,
  },
  { collection: "clases" },
);

module.exports = mongoose.model("clases", ClasesSchema);
