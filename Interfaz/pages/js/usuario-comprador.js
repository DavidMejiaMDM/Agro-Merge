// ==========================================
// LÓGICA DEL DASHBOARD DE COMPRADOR/VENDEDOR
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Recuperar el email de la URL si existe
    const urlParams = new URLSearchParams(window.location.search);
    const emailEnUrl = urlParams.get("email");
    if(emailEnUrl) {
        localStorage.setItem("userEmail", emailEnUrl);
    }

    const emailUsuario = localStorage.getItem("userEmail");
    console.log("👉 1. Correo detectado para buscar:", emailUsuario);

    // 2. Traer los datos del usuario desde el servidor
    if(emailUsuario) {
        fetch(`http://localhost:3000/api/usuario?email=${emailUsuario}`)
            .then(res => res.json())
            .then(data => {
                console.log("👉 2. Datos recibidos de la base de datos:", data); 
                
                if(data.error) {
                    console.error("❌ Error del servidor:", data.error);
                    return;
                }

                // Función auxiliar para inyectar datos de forma segura
                const inyectarDato = (id, valor) => {
                    const elemento = document.getElementById(id);
                    if (elemento) {
                        // Si es un input usamos .value, si es texto usamos .textContent
                        if (elemento.tagName === 'INPUT' || elemento.tagName === 'TEXTAREA') {
                            elemento.value = valor;
                        } else {
                            elemento.textContent = valor;
                        }
                    } else {
                        console.warn(`⚠️ No se encontró en el HTML el elemento con id="${id}"`);
                    }
                };

                // --- ACTUALIZACIÓN DE DATOS ---
                
                // Navbar
                inyectarDato("nav-username", data.nombre);
                if (document.getElementById("nav-avatar") && data.nombre) {
                    document.getElementById("nav-avatar").textContent = data.nombre.charAt(0).toUpperCase();
                }
                
                // Formulario "Mis Datos"
                inyectarDato("display-nombre", data.nombre);
                inyectarDato("display-documento", data.documento || "No registrado");
                inyectarDato("display-correo", data.email || emailUsuario);
                
                if(data.telefono) {
                    inyectarDato("telefono", data.telefono);
                }
            })
            .catch(err => console.error("❌ Error cargando perfil:", err));
    } else {
        console.error("❌ No hay correo guardado en localStorage. El usuario no está logueado correctamente.");
    }

    

    // 3. Guardar el nuevo teléfono
    const formMisDatos = document.getElementById("form-mis-datos");
    if (formMisDatos) {
        formMisDatos.addEventListener("submit", function(e) {
            e.preventDefault(); 
            // ... (Tu lógica de guardar teléfono que ya tenías se mantiene igual)
        });
    }
});