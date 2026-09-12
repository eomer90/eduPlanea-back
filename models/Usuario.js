const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
  {
    nombre: String,
    correo: String,
    username: String,
    password: String,
    admin: Boolean,
    escuelaId: mongoose.Schema.Types.ObjectId,

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { collection: "usuarios" },
);

module.exports = mongoose.model("usuarios", usuarioSchema);
