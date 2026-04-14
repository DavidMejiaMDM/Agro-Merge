// ==========================================
// LÓGICA DE ACTUALIZACIÓN DE CONTRASEÑA
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Recuperamos el correo que guardamos en la primera pantalla
    const savedEmail = localStorage.getItem('userEmail');
    const hiddenEmailInput = document.getElementById('hiddenEmail');
    
    if (savedEmail && hiddenEmailInput) {
        hiddenEmailInput.value = savedEmail;
    } else {
        console.warn("No se encontró el correo del usuario en localStorage.");
    }

    // 2. Validación para asegurar que las contraseñas coincidan
    const form = document.getElementById('resetPasswordForm');
    const newPassword = document.getElementById('new_password');
    const confirmPassword = document.getElementById('confirm_password');
    const errorMessage = document.getElementById('errorMessage');

    if (form) {
        form.addEventListener('submit', function(event) {
            if (newPassword.value !== confirmPassword.value) {
                // Si no son iguales, detenemos el envío del formulario y mostramos el error
                event.preventDefault(); 
                errorMessage.style.display = 'block';
                confirmPassword.style.borderColor = '#dc2626'; // Borde rojo
            } else {
                // Si todo está bien, ocultamos el error y dejamos que el form haga el POST
                errorMessage.style.display = 'none';
                confirmPassword.style.borderColor = '#ccc';
                
                // Opcional: Limpiar el localStorage si ya no lo necesitamos
                // localStorage.removeItem('userEmail'); 
            }
        });
    }
});