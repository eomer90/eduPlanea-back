const mongoose = require("mongoose");

const recordatorioSchema = new mongoose.Schema(
  {
    nombre: String,
    fecha: Date,
    hora: String,
    descripcion: String,
    usuarioId: mongoose.Schema.Types.ObjectId,
    escuelaId: mongoose.Schema.Types.ObjectId,
  },

  { collection: "recordatorios" },
);

module.exports = mongoose.model("recordatorios", recordatorioSchema);
