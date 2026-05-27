document.addEventListener("DOMContentLoaded", () => {
  const formularios = document.querySelectorAll(".role-pane form");

  const obtenerCampos = (form) => {
    const inputCorreo = form.querySelector('input[name="correo_usuario"]');
    const inputRol = form.querySelector('input[name="rol_usuario"]');
    const inputClave = form.querySelector('input[name="clave_usuario"]');
    const inputConfirmar = form.querySelector('input[name="confirmar_clave_usuario"]');
    return { inputCorreo, inputRol, inputClave, inputConfirmar };
  };

  const almacenarCorreos = (correo, rol) => {
    if (!correo) return;
    const correoNormalizado = correo.trim().toLowerCase();

    localStorage.setItem("userEmail", correoNormalizado);
    localStorage.setItem("usuario_email", correoNormalizado);

    if (rol === "vendedor" || rol === "empresa") {
      localStorage.setItem("emailRegistroVendedor", correoNormalizado);
      try {
        sessionStorage.setItem("emailRegistroVendedor", correoNormalizado);
      } catch (_) {}
    } else {
      localStorage.removeItem("emailRegistroVendedor");
      try {
        sessionStorage.removeItem("emailRegistroVendedor");
      } catch (_) {}
    }
  };

  const obtenerRolActivoDesdeTabs = () => {
    if (document.getElementById("tab-comprador")?.checked) return "comprador";
    if (document.getElementById("tab-vendedor")?.checked) return "vendedor";
    if (document.getElementById("tab-empresa")?.checked) return "empresa";
    return "";
  };

  const validarFormulario = (form) => {
    const { inputCorreo, inputRol, inputClave, inputConfirmar } = obtenerCampos(form);

    if (!form.action || !form.method) return { ok: false, mensaje: "El formulario no tiene action/method." };
    if (!inputRol || !inputRol.value.trim()) return { ok: false, mensaje: "No se detectó el rol del usuario." };
    if (!["comprador", "vendedor", "empresa"].includes(inputRol.value.trim())) return { ok: false, mensaje: "Rol inválido." };
    if (!inputCorreo || !inputCorreo.value.trim()) return { ok: false, mensaje: "Debes ingresar un correo válido." };
    if (!inputClave || !inputConfirmar) return { ok: false, mensaje: "Faltan campos de contraseña." };
    if (inputClave.value !== inputConfirmar.value) return { ok: false, mensaje: "Las contraseñas no coinciden." };
    if (inputClave.value.length < 8) return { ok: false, mensaje: "La contraseña debe tener al menos 8 caracteres." };

    return { ok: true };
  };

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

      const rolFormulario = (inputRol?.value || "").trim().toLowerCase();
      const rolPorTab = obtenerRolActivoDesdeTabs();
      const rolAEnviar =
        ["comprador", "vendedor", "empresa"].includes(rolFormulario) ? rolFormulario : rolPorTab;

      const datosFormulario = new URLSearchParams(new FormData(form));
      datosFormulario.set("rol_usuario", rolAEnviar || "comprador");

      const respuesta = await fetch(form.action, {
        method: form.method.toUpperCase(),
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: datosFormulario.toString()
      });

      let payload = null;
      try { payload = await respuesta.json(); } catch (_) {}

      if (!respuesta.ok) {
        alert(payload?.mensaje || payload?.error || "No se pudo completar el registro.");
        return;
      }

      const rolFinal = (payload?.rol_usuario || rolAEnviar || "comprador").trim().toLowerCase();

      almacenarCorreos(inputCorreo.value, rolFinal);
      localStorage.setItem("userRole", rolFinal);
      localStorage.setItem("usuario_rol", rolFinal);

      window.location.href =
        `../Confirmar-codigo/confirmar-codigo.html?email=${encodeURIComponent(
          inputCorreo.value.trim().toLowerCase()
        )}&rol=${encodeURIComponent(rolFinal)}`;
    } catch (error) {
      console.error("Error conectando con backend:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      if (botonSubmit) {
        botonSubmit.disabled = false;
        botonSubmit.textContent =
          inputRol?.value === "vendedor"
            ? "Registrarse como vendedor"
            : inputRol?.value === "empresa"
            ? "Registrarse como empresa"
            : "Registrarse";
      }
    }
  };

  formularios.forEach((form) => form.addEventListener("submit", manejarEnvioRegistro));
});