// ==========================================
// LÓGICA DE RECUPERAR CONTRASEÑA - AGRO-MERGE
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    
    const form = document.querySelector('.form');
    const emailInput = document.getElementById('email');

    if (form && emailInput) {
        form.addEventListener('submit', function() {
            // Guardamos el correo en el localStorage antes de que el formulario
            // viaje al servidor. Así la siguiente pantalla sabrá a qué cuenta
            // se le está intentando cambiar la contraseña.
            localStorage.setItem('userEmail', emailInput.value);
        });
    }
});