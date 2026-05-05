/**
 * @fileoverview Lógica de validación y envío para formularios de registro (comprador, vendedor, empresa).
 */

document.addEventListener("DOMContentLoaded", () => {
  const formularios = document.querySelectorAll(".role-pane form");

  /**
   * Obtiene campos clave del formulario.
   * @param {HTMLFormElement} form
   */
  const obtenerCampos = (form) => {
    const inputCorreo = form.querySelector('input[name="correo_usuario"]');
    const inputRol = form.querySelector('input[name="rol_usuario"]');
    const inputClave = form.querySelector('input[name="clave_usuario"]');
    const inputConfirmar = form.querySelector('input[name="confirmar_clave_usuario"]');

    return { inputCorreo, inputRol, inputClave, inputConfirmar };
  };

  /**
   * Guarda el correo para reutilizarlo en verificación de código.
   * @param {string} correo
   */
  const almacenarCorreoSeguro = (correo) => {
    if (!correo) return;
    try {
      localStorage.setItem("userEmail", correo.trim());
      console.log("Correo guardado en localStorage:", correo.trim());
    } catch (error) {
      console.warn("No se pudo guardar userEmail en localStorage.", error);
    }
  };

  /**
   * Validaciones mínimas de formulario antes de enviar.
   * @param {HTMLFormElement} form
   * @returns {{ok:boolean, mensaje?:string}}
   */
  const validarFormulario = (form) => {
    const { inputCorreo, inputRol, inputClave, inputConfirmar } = obtenerCampos(form);

    if (!form.action || !form.method) {
      return { ok: false, mensaje: "El formulario no tiene action/method configurados." };
    }

    if (!inputRol || !inputRol.value.trim()) {
      return { ok: false, mensaje: "No se detectó el rol del usuario." };
    }

    if (!["comprador", "vendedor", "empresa"].includes(inputRol.value.trim())) {
      return { ok: false, mensaje: "El rol de usuario es inválido." };
    }

    if (!inputCorreo || !inputCorreo.value.trim()) {
      return { ok: false, mensaje: "Debes ingresar un correo válido." };
    }

    if (!inputClave || !inputConfirmar) {
      return { ok: false, mensaje: "Faltan campos de contraseña." };
    }

    if (inputClave.value !== inputConfirmar.value) {
      return { ok: false, mensaje: "Las contraseñas no coinciden." };
    }

    if (inputClave.value.length < 8) {
      return { ok: false, mensaje: "La contraseña debe tener al menos 8 caracteres." };
    }

    return { ok: true };
  };

  /**
   * Maneja envío asíncrono de cada formulario.
   * @param {SubmitEvent} evento
   */
  const manejarEnvioRegistro = async (evento) => {
    evento.preventDefault();

    const form = evento.target;
    const botonSubmit = form.querySelector('button[type="submit"]');
    const { inputCorreo, inputRol } = obtenerCampos(form);

    const validacion = validarFormulario(form);
    if (!validacion.ok) {
      alert(validacion.mensaje);
      return;
    }

    try {
      if (botonSubmit) {
        botonSubmit.disabled = true;
        botonSubmit.textContent = "Registrando...";
      }

      const datosFormulario = new URLSearchParams(new FormData(form));

      // Refuerzo por seguridad: asegura rol enviado.
      if (!datosFormulario.get("rol_usuario") && inputRol) {
        datosFormulario.append("rol_usuario", inputRol.value.trim());
      }

      const respuesta = await fetch(form.action, {
        method: form.method.toUpperCase(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: datosFormulario.toString()
      });

      // Intenta leer respuesta JSON si existe
      let payload = null;
      try {
        payload = await respuesta.json();
      } catch (_) {
        // Si el backend responde texto o vacío, seguimos sin romper.
      }

      if (!respuesta.ok) {
        const mensajeError = payload?.mensaje || payload?.error || "No se pudo completar el registro.";
        alert(mensajeError);
        return;
      }

      almacenarCorreoSeguro(inputCorreo.value);

      // Si backend devuelve rol, lo persistimos para uso en login/index.
      const rolFinal = payload?.rol_usuario || inputRol.value.trim();
      localStorage.setItem("userRole", rolFinal);

      // Redirección a verificación de código
      window.location.href = "../Confirmar-codigo/confirmar-codigo.html";
    } catch (error) {
      console.error("Error conectando con backend:", error);
      alert("No se pudo conectar con el servidor. Verifica que el backend esté encendido.");
    } finally {
      if (botonSubmit) {
        botonSubmit.disabled = false;
        botonSubmit.textContent = inputRol?.value === "vendedor"
          ? "Registrarse como vendedor"
          : inputRol?.value === "empresa"
          ? "Registrarse como empresa"
          : "Registrarse";
      }
    }
  };

  if (!formularios.length) {
    console.warn("No se encontraron formularios de registro.");
    return;
  }

  formularios.forEach((form) => {
    form.addEventListener("submit", manejarEnvioRegistro);
  });
});