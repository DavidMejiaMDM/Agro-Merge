/**
 * @fileoverview Lógica de validación y envío para los formularios de registro de Agro-Merge.
 */

document.addEventListener("DOMContentLoaded", () => {
    const formularios = document.querySelectorAll('form');

    const validarContrasenas = (inputsPassword) => {
        if (inputsPassword.length >= 2) {
            return inputsPassword[0].value === inputsPassword[1].value;
        }
        return true; 
    };

    const almacenarCorreoSeguro = (inputCorreo) => {
        if (inputCorreo && inputCorreo.value.trim()) {
            try {
                localStorage.setItem('userEmail', inputCorreo.value.trim());
                console.log("✅ Correo guardado exitosamente en localStorage:", inputCorreo.value.trim());
            } catch (error) {
                console.warn("Agro-Merge: No se pudo acceder a localStorage.", error);
            }
        }
    };

    const manejarEnvioRegistro = async (evento) => {
        // 🛑 ESTO ES LA MAGIA: Detiene el viaje automático al puerto 3000
        evento.preventDefault(); 

        const form = evento.target;
        const inputCorreo = form.querySelector('input[type="email"]');
        const inputsPassword = form.querySelectorAll('input[type="password"]');

        // 1. Fase de Validación
        if (!validarContrasenas(inputsPassword)) {
            alert("¡Las contraseñas no coinciden! Por favor, verifica que las hayas escrito igual.");
            return; 
        }

        // 2. Fase de Almacenamiento
        almacenarCorreoSeguro(inputCorreo);

        // 3. Fase de Envío Profesional al Servidor (Fetch API)
        try {
            // Empaquetamos los datos del formulario tal cual los espera tu backend
            const datosFormulario = new URLSearchParams(new FormData(form));

            // Enviamos los datos "por debajo" a http://localhost:3000/registro sin cambiar de pestaña
            const respuesta = await fetch(form.action, {
                method: form.method,
                body: datosFormulario
            });

            // Si el servidor recibe los datos correctamente y responde con éxito:
            if (respuesta.ok) {
                // Hacemos la redirección nosotros mismos, manteniendo el mismo puerto (ej. 5500)
                // Así el localStorage sobrevive intacto.
                window.location.href = '../Confirmar-codigo/confirmar-codigo.html';
            } else {
                alert("Hubo un error al registrar en el servidor. Revisa la consola.");
            }
        } catch (error) {
            console.error("Error conectando con el backend:", error);
            alert("No se pudo conectar con el servidor (¿Está encendido el puerto 3000?).");
        }
    };

    if (formularios.length > 0) {
        formularios.forEach(form => form.addEventListener('submit', manejarEnvioRegistro));
    }
});