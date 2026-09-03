const mongoose = require("mongoose");

const escuelaSchema = new mongoose.Schema(
  {
    nombre: String,
    nivelEducativo: String,
  },
  { collection: "escuelas" },
);

module.exports = mongoose.model("escuelas", escuelaSchema);
