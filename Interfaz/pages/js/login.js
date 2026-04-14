/**
 * @fileoverview Lógica de inicio de sesión de Agro-Merge usando Fetch API.
 */

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector('.form');
    const emailInput = document.getElementById('email');

    if (loginForm) {
        loginForm.addEventListener('submit', async (evento) => {
            evento.preventDefault(); 

            try {
                const datosFormulario = new URLSearchParams(new FormData(loginForm));
                const respuesta = await fetch(loginForm.action, {
                    method: loginForm.method,
                    body: datosFormulario
                });

                if (respuesta.ok) {
                    // 1. Extraemos un nombre del correo para mostrarlo en el saludo
                    let nombreExtraido = emailInput.value.split('@')[0];
                    let nombreLimpio = nombreExtraido.charAt(0).toUpperCase() + nombreExtraido.slice(1);

                    // 2. GUARDADO DE SEGURIDAD (Esto es lo que faltaba en tu versión anterior)
                    localStorage.setItem('sesionIniciada', 'true');
                    localStorage.setItem('nombreUsuario', nombreLimpio);
                    localStorage.setItem('userEmail', emailInput.value);

                    // 3. Redirigimos a la página principal
                    window.location.href = "../../index.html?login=true&nombre=" + nombreLimpio + "&email=" + emailInput.value;
                    
                } else {
                    alert("Correo o contraseña incorrectos.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("No se pudo conectar con el servidor.");
            }
        });
    }
});