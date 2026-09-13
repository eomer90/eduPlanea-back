const mongoose = require("mongoose");

const escuelaSchema = new mongoose.Schema(
  {
    nombreEscuela: String,
    nivelEducativo: String,
  },
  { collection: "escuelas" },
);

module.exports = mongoose.model("escuelas", escuelaSchema);
