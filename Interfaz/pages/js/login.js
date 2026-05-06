/**
 * @fileoverview Lógica de inicio de sesión de Agro-Merge usando Fetch API.
 */

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".form");
  const emailInput = document.getElementById("email");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    try {
      const datosFormulario = new URLSearchParams(new FormData(loginForm));

      const respuesta = await fetch(loginForm.action, {
        method: loginForm.method,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: datosFormulario.toString(),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        // Caso especial: usuario inactivo (requiere verificación)
        if (data.requiere_verificacion) {
          alert(data.mensaje || "Debes verificar tu cuenta.");
          // Si tienes página de código, redirige:
          // window.location.href = "../Codigo-Verificacion/Codigo-Verificacion.html";
          return;
        }

        alert(data.mensaje || "Correo o contraseña incorrectos.");
        return;
      }

      // Datos del backend
      const email = (data?.usuario?.email || emailInput.value || "").trim().toLowerCase();
      const rol = data?.usuario?.rol || "comprador";
      const nombreServidor = data?.usuario?.nombre?.trim();

      // Si no viene nombre del backend, extrae del correo
      let nombreLimpio = nombreServidor;
      if (!nombreLimpio) {
        const nombreExtraido = email.split("@")[0] || "Usuario";
        nombreLimpio = nombreExtraido.charAt(0).toUpperCase() + nombreExtraido.slice(1);
      }

      // Guardado de sesión (compatibilidad con módulos viejos + nuevos)
      localStorage.setItem("sesionIniciada", "true");
      localStorage.setItem("nombreUsuario", nombreLimpio);
      localStorage.setItem("userEmail", email);       // legacy
      localStorage.setItem("usuario_email", email);   // <-- CLAVE para productos
      localStorage.setItem("usuario_rol", rol);

      // Redirección por rol (ajusta rutas a tus pantallas reales)
      if (rol === "vendedor" || rol === "empresa") {
        window.location.href = "../../index.html?login=true";
      } else {
        window.location.href = "../../index.html?login=true";
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("No se pudo conectar con el servidor.");
    }
  });
});