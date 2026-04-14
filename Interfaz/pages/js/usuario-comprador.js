// ==========================================
// LÓGICA DEL DASHBOARD DE COMPRADOR - AGRO-MERGE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Recuperar el email de la URL si existe
    const urlParams = new URLSearchParams(window.location.search);
    const emailEnUrl = urlParams.get("email");
    if(emailEnUrl) {
        localStorage.setItem("userEmail", emailEnUrl);
    }

    const emailUsuario = localStorage.getItem("userEmail");

    // 2. Traer los datos del usuario desde el servidor
    if(emailUsuario) {
        fetch(`http://localhost:3000/api/usuario?email=${emailUsuario}`)
            .then(res => res.json())
            .then(data => {
                console.log("Datos recibidos del servidor:", data); 
                
                if(data.error) {
                    console.error("Error del servidor:", data.error);
                    return;
                }

                // --- ACTUALIZACIÓN DE DATOS EN PANTALLA ---
                
                // Navbar y Avatar
                document.getElementById("nav-username").textContent = data.nombre;
                // Extrae la primera letra para el avatar
                document.getElementById("nav-avatar").textContent = data.nombre.charAt(0).toUpperCase();
                
                // Datos Personales
                document.getElementById("display-nombre").textContent = data.nombre;
                document.getElementById("display-documento").textContent = data.documento || "No registrado";
                
                // Datos de Contacto
                document.getElementById("display-correo").textContent = data.email || emailUsuario;
                
                if(data.telefono) {
                    document.getElementById("telefono").value = data.telefono;
                }
            })
            .catch(err => console.error("Error cargando perfil:", err));
    }

    // 3. Guardar el nuevo teléfono en la base de datos
    const formMisDatos = document.getElementById("form-mis-datos");
    if (formMisDatos) {
        formMisDatos.addEventListener("submit", function(e) {
            e.preventDefault(); 
            
            const nuevoTelefono = document.getElementById("telefono").value;
            const botonGuardar = document.getElementById("btn-guardar");

            // Feedback visual de carga
            botonGuardar.textContent = "Guardando...";
            botonGuardar.style.opacity = "0.7";

            fetch("http://localhost:3000/api/actualizar-telefono", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailUsuario, telefono: nuevoTelefono })
            })
            .then(res => res.json())
            .then(data => {
                // Restaurar botón
                botonGuardar.textContent = "Guardar cambios";
                botonGuardar.style.opacity = "1";

                if(data.success) {
                    // Mostrar mensaje de éxito
                    const toast = document.getElementById("toast");
                    toast.style.display = "block";
                    setTimeout(() => toast.style.display = "none", 4000);
                } else {
                    alert("Hubo un error al guardar el teléfono.");
                }
            })
            .catch(err => {
                console.error("Error guardando:", err);
                botonGuardar.textContent = "Guardar cambios";
                botonGuardar.style.opacity = "1";
            });
        });
    }
});