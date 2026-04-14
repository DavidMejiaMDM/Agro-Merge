// ==========================================
// LÓGICA DE CONFIRMACIÓN DE CÓDIGO
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Recuperar el correo del localStorage
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        document.getElementById('displayEmail').textContent = savedEmail;
        document.getElementById('hiddenEmail').value = savedEmail;
    } else {
        document.getElementById('displayEmail').textContent = "Correo no detectado";
        console.error("Error: userEmail no encontrado en localStorage");
    }

    // 2. Saltar automáticamente entre cuadros al escribir
    const inputs = document.querySelectorAll('.code-box');
    
    inputs.forEach((input, index) => {
        // Evento para avanzar al siguiente input
        input.addEventListener('input', (e) => {
            if (e.inputType === "deleteContentBackward") return; 
            if (input.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        
        // Evento para retroceder al borrar con Backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === "Backspace" && !input.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

});