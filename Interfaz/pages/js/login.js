/**
 * @fileoverview Lógica de inicio de sesión de Agro-Merge usando Fetch API.
 * IMPORTANTE: Abre la app en http://localhost:3000 (node server.js).
 * No uses Live Server (puerto 5500).
 */

const API_BASE = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".form");
  const emailInput = document.getElementById("email");

  if (!loginForm) return;

  // Aviso si abrieron la página con Live Server por error
  if (window.location.port === "5500") {
    console.warn(
      "Estás en Live Server (5500). Usa: http://localhost:3000/pages/Login/login.html"
    );
  }

  loginForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    try {
      const datosFormulario = new URLSearchParams(new FormData(loginForm));

      const respuesta = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: datosFormulario.toString(),
      });

      let data = {};
      try {
        data = await respuesta.json();
      } catch {
        throw new Error("Respuesta inválida del servidor");
      }

      if (!respuesta.ok) {
        if (data.requiere_verificacion) {
          alert(data.mensaje || "Debes verificar tu cuenta.");
          const correo = encodeURIComponent(
            (data.correo_usuario || emailInput.value || "").trim().toLowerCase()
          );
          window.location.href = `${API_BASE}/pages/Confirmar-codigo/confirmar-codigo.html?email=${correo}`;
          return;
        }

        alert(data.mensaje || "Correo o contraseña incorrectos.");
        return;
      }

      const email = (data?.usuario?.email || emailInput.value || "").trim().toLowerCase();
      const rol = data?.usuario?.rol || "comprador";
      const nombreServidor = data?.usuario?.nombre?.trim();

      let nombreLimpio = nombreServidor;
      if (!nombreLimpio) {
        const nombreExtraido = email.split("@")[0] || "Usuario";
        nombreLimpio = nombreExtraido.charAt(0).toUpperCase() + nombreExtraido.slice(1);
      }

      localStorage.setItem("sesionIniciada", "true");
      localStorage.setItem("nombreUsuario", nombreLimpio);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("usuario_email", email);
      localStorage.setItem("usuario_rol", rol);
      localStorage.setItem("userRole", rol);

      if (rol !== "vendedor" && rol !== "empresa") {
        localStorage.removeItem("emailRegistroVendedor");
        try {
          sessionStorage.removeItem("emailRegistroVendedor");
        } catch (_) {}
      }

      window.location.href = `${API_BASE}/Index.html?login=true`;
    } catch (error) {
      console.error("Error en login:", error);
      alert(
        "No se pudo conectar con el servidor.\n\n1) cd backend\n2) node server.js\n3) Abre http://localhost:3000/pages/Login/login.html"
      );
    }
  });
});
