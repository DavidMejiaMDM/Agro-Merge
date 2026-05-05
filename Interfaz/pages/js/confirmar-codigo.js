document.addEventListener("DOMContentLoaded", () => {
  const displayEmail = document.getElementById("displayEmail");
  const hiddenEmail = document.getElementById("hiddenEmail");
  const form = document.getElementById("verifyForm");
  const inputs = document.querySelectorAll(".code-box");

  // 1) Recuperar correo guardado
  const savedEmail = localStorage.getItem("userEmail");
  if (savedEmail) {
    displayEmail.textContent = savedEmail;
    hiddenEmail.value = savedEmail;
  } else {
    displayEmail.textContent = "Correo no detectado";
    console.error("userEmail no encontrado en localStorage");
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
    const codigoCompleto = Array.from(inputs).every((i) => /^\d$/.test(i.value));
    if (!hiddenEmail.value || !codigoCompleto) {
      e.preventDefault();
      alert("Debes ingresar los 4 dígitos y tener un correo válido.");
    }
  });
});