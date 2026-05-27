document.addEventListener("DOMContentLoaded", () => {
  const displayEmail = document.getElementById("displayEmail");
  const hiddenEmail = document.getElementById("hiddenEmail");
  const form = document.getElementById("verifyForm");
  const inputs = document.querySelectorAll(".code-box");

  function normalizarEmail(valor) {
    return (valor || "").trim().toLowerCase();
  }

  function leerCookieAgroEmail() {
    const match = document.cookie.match(/(?:^|;\s*)agro_email=([^;]*)/);
    if (!match) return "";
    try {
      return normalizarEmail(decodeURIComponent(match[1]));
    } catch (_) {
      return normalizarEmail(match[1]);
    }
  }

  function sincronizarEmail(email) {
    const limpio = normalizarEmail(email);
    if (!limpio) return "";
    localStorage.setItem("userEmail", limpio);
    localStorage.setItem("usuario_email", limpio);
    localStorage.setItem("emailRegistroVendedor", limpio);
    try {
      sessionStorage.setItem("emailRegistroVendedor", limpio);
    } catch (_) {}
    return limpio;
  }

  function obtenerEmailInicial() {
    const params = new URLSearchParams(window.location.search);
    const desdeUrl = normalizarEmail(params.get("email"));
    if (desdeUrl) return sincronizarEmail(desdeUrl);

    const desdeCookie = leerCookieAgroEmail();
    if (desdeCookie) return sincronizarEmail(desdeCookie);

    return sincronizarEmail(
      localStorage.getItem("emailRegistroVendedor") ||
        localStorage.getItem("usuario_email") ||
        localStorage.getItem("userEmail") ||
        sessionStorage.getItem("emailRegistroVendedor") ||
        ""
    );
  }

  const savedEmail = obtenerEmailInicial();
  if (savedEmail) {
    displayEmail.textContent = savedEmail;
    hiddenEmail.value = savedEmail;
    hiddenEmail.name = "correo_usuario";
  } else {
    displayEmail.textContent = "Correo no detectado";
    console.error("No se encontró correo en URL, cookie ni storage");
  }

  // 2) Solo permitir números + salto automático
  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      // Limita a un dígito numérico
      input.value = input.value.replace(/\D/g, "").slice(0, 1);

      // Avanza al siguiente input si escribió algo
      if (input.value && index < inputs.length - 1 && e.inputType !== "deleteContentBackward") {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      // Retrocede con backspace si el actual está vacío
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });

  // 3) Validación antes de enviar
  form.addEventListener("submit", (e) => {
    const correo = sincronizarEmail(hiddenEmail.value);
    const codigoCompleto = Array.from(inputs).every((i) => /^\d$/.test(i.value));
    if (!correo || !codigoCompleto) {
      e.preventDefault();
      alert("Debes ingresar los 4 dígitos y tener un correo válido.");
      return;
    }
    hiddenEmail.value = correo;
    if (!hiddenEmail.name) hiddenEmail.name = "correo_usuario";
  });
});