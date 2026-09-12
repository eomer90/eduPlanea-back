const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const enviarCorreoRecuperacion = async (correo, enlace) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: correo,
      subject: "Recuperación de contraseña - EduPlanea",
      html: `
        <h2>Recuperación de contraseña</h2>

        <p>Has solicitado restablecer la contraseña de tu cuenta de EduPlanea.</p>

        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>

        <a href="${enlace}">
          Restablecer contraseña
        </a>

        <p>Este enlace tendrá una duración limitada.</p>

        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      `,
    });

    return true;
  } catch (error) {
    console.log("ERROR AL ENVIAR CORREO:", error);
    return false;
  }
};

module.exports = enviarCorreoRecuperacion;
