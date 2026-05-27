document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = 'http://localhost:3000';
    const contenedor = document.getElementById('contenedor-productos');
    const btnAnadirMas = document.getElementById('btn_anadir_mas');
    const btnContinuar = document.getElementById('btn_continuar');

    function obtenerEmailProceso() {
        const params = new URLSearchParams(window.location.search);
        const emailQuery = params.get('email')?.trim().toLowerCase();

        if (emailQuery) {
            localStorage.setItem('emailRegistroVendedor', emailQuery);
            localStorage.setItem('usuario_email', emailQuery);
            localStorage.setItem('userEmail', emailQuery);
            try { sessionStorage.setItem('emailRegistroVendedor', emailQuery); } catch (_) {}
            return emailQuery;
        }

        return (
            localStorage.getItem('emailRegistroVendedor') ||
            localStorage.getItem('usuario_email') ||
            localStorage.getItem('userEmail') ||
            sessionStorage.getItem('emailRegistroVendedor') ||
            ''
        ).trim().toLowerCase();
    }

    const emailProceso = obtenerEmailProceso();

    if (!emailProceso) {
        contenedor.innerHTML = `
            <div class="empty-state">
                <p><strong>No se encontró el correo del proceso de registro.</strong></p>
                <p style="margin-top:6px;">Vuelve al paso de registro de vendedor.</p>
            </div>
        `;
        return;
    }

    const formatoPrecio = (valor) => new Intl.NumberFormat('es-CO').format(Number(valor) || 0);

    function renderProductos(productos) {
        if (!productos.length) {
            contenedor.innerHTML = `
                <div class="empty-state">
                    <p><strong>Aún no has subido productos.</strong></p>
                    <p style="margin-top:6px;">Regresa y añade al menos uno.</p>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = productos.map((p) => `
            <article class="product-card">
                <img class="product-image" src="${p.imagen_url}" alt="Imagen de ${p.nombre}">
                <div class="product-body">
                    <h3 class="product-name">${p.nombre}</h3>
                    <div class="meta-row">
                        <span class="price">$ ${formatoPrecio(p.precio)}</span>
                        <span class="pill">${p.tipo_venta || 'N/A'}</span>
                    </div>
                </div>
            </article>
        `).join('');
    }

    async function cargarProductos() {
        try {
            const response = await fetch(`${API_BASE}/api/productos?email=${encodeURIComponent(emailProceso)}`);
            const data = await response.json();

            if (!response.ok || !data.ok) {
                contenedor.innerHTML = `<p>${data?.mensaje || 'No se pudieron cargar los productos.'}</p>`;
                return;
            }

            renderProductos(data.productos || []);
        } catch (error) {
            console.error(error);
            contenedor.innerHTML = '<p>Error de conexión al cargar productos.</p>';
        }
    }

    btnAnadirMas?.addEventListener('click', () => {
        window.location.href =
            `${API_BASE}/pages/Agregar-Productos/Agregar-Productos.html?email=${encodeURIComponent(emailProceso)}`;
    });

    btnContinuar?.addEventListener('click', () => {
        alert('✅ Productos confirmados. Continúa al siguiente paso.');
    });

    await cargarProductos();
});