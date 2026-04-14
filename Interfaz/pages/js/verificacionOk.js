// ==========================================
// LÓGICA DE ÉXITO DE CONTRASEÑA - AGRO-MERGE
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    // Limpieza de seguridad: Como ya terminamos de cambiar la contraseña,
    // borramos el correo de la memoria del navegador (localStorage)
    // para que no quede expuesto en el equipo.
    localStorage.removeItem('userEmail');
});