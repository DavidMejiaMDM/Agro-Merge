document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. LÓGICA DE SESIÓN Y HEADER
    // ==========================================
    const parametrosUrl = new URLSearchParams(window.location.search);
    
    // Recepción de datos de login por URL
    if (parametrosUrl.get('login') === 'true') {
        localStorage.setItem('sesionIniciada', 'true');
        localStorage.setItem('nombreUsuario', parametrosUrl.get('nombre'));
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const sesionIniciada = localStorage.getItem('sesionIniciada');
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    const btnLogin = document.getElementById('btn-login');

    if (sesionIniciada === 'true' && btnLogin) {
        // --- MENÚ DE PERFIL ---
        btnLogin.outerHTML = `
        <div style="position: relative; display: inline-block;">
            <button id="btn-user-menu" style="background: none; border: none; cursor: pointer; font: inherit; color: inherit; display: flex; align-items: center; gap: 5px; padding: 5px;">
                <i class="fa-regular fa-user"></i> ${nombreUsuario} <span style="font-size: 0.7em;">▼</span>
            </button>
            <div id="dropdown-menu" style="display: none; position: absolute; top: 100%; right: 0; background-color: white; min-width: 160px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); border-radius: 5px; overflow: hidden; z-index: 1000; text-align: left;">
                <a href="pages/Perfil/perfil.html" style="padding: 12px 16px; text-decoration: none; color: black; display: block; border-bottom: 1px solid #eee;">Mi Perfil</a>
                <a href="#" style="padding: 12px 16px; text-decoration: none; color: black; display: block; border-bottom: 1px solid #eee;">Configuración</a>
                <a href="#" id="btn-logout" style="padding: 12px 16px; text-decoration: none; color: #dc2626; display: block; font-weight: bold;">Cerrar Sesión</a>
            </div>
        </div>
        `;

        document.getElementById('btn-user-menu').addEventListener('click', function() {
            const menu = document.getElementById('dropdown-menu');
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });

        document.getElementById('btn-logout').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('sesionIniciada');
            localStorage.removeItem('nombreUsuario');
            localStorage.removeItem('carritoAgro'); 
            window.location.reload(); 
        });
    }

    // ==========================================
    // 2. LÓGICA DEL CARRITO (Traer datos del Storage)
    // ==========================================
    let carrito = JSON.parse(localStorage.getItem('carritoAgro')) || [];
    const costoEnvio = 7900;

    const contenedorItems = document.getElementById('contenedor-items-checkout');
    const lblSubtotal = document.getElementById('checkout-subtotal');
    const lblTotal = document.getElementById('checkout-total');

    function renderizarResumen() {
        contenedorItems.innerHTML = '';
        let subtotal = 0;
        let totalProductos = 0;

        if (carrito.length === 0) {
            contenedorItems.innerHTML = '<p style="color:#888; font-size:13px;">No hay artículos en tu carrito.</p>';
            actualizarTextos(0, 0);
            return;
        }

        carrito.forEach(prod => {
            subtotal += prod.precio * prod.cantidad;
            totalProductos += prod.cantidad;

            contenedorItems.innerHTML += `
                <div class="item-resumen">
                    <img src="${prod.imagen}" alt="${prod.nombre}">
                    <div class="item-info">
                        <p class="item-marca">${prod.marca}</p>
                        <p class="item-nombre">${prod.nombre}</p>
                        <p class="item-precio-cant">
                            <span>${prod.cantidad} x</span> $${prod.precio.toLocaleString('es-CO')}
                        </p>
                    </div>
                </div>
            `;
        });

        actualizarTextos(totalProductos, subtotal);
    }

    function actualizarTextos(cantidad, subtotal) {
        document.getElementById('checkout-cantidad-titulos').innerText = `(${cantidad} productos)`;
        document.getElementById('resumen-cantidad-articulos').innerText = `${cantidad} Artículos`;
        
        lblSubtotal.innerText = '$' + subtotal.toLocaleString('es-CO');
        lblTotal.innerText = '$' + (subtotal > 0 ? subtotal + costoEnvio : 0).toLocaleString('es-CO');
    }

    renderizarResumen();

    // ==========================================
    // 3. LÓGICA DE PESTAÑAS (Envío -> Pago)
    // ==========================================
    
    // Función para avanzar a la pestaña de Pago
    window.irAPago = function() {
        // Capturar lo que digitó el usuario
        const nombre = document.getElementById('in-nombre').value.trim();
        const direccion = document.getElementById('in-direccion').value.trim();
        const ciudad = document.getElementById('in-ciudad').value.trim();
        const region = document.getElementById('in-region').value.trim();

        // Validación simple para que no dejen en blanco
        if(!nombre || !direccion || !ciudad) {
            alert("Por favor, llena los campos obligatorios (*) como Nombre, Dirección y Ciudad.");
            return;
        }

        // Inyectar los datos en los cuadros de texto del resumen
        document.getElementById('out-contacto').innerText = nombre;
        document.getElementById('out-direccion').innerText = `${direccion}, ${ciudad} ${region ? '- ' + region : ''}`;

        // Ocultar sección de envío, mostrar sección de pago
        document.getElementById('seccion-envio').style.display = 'none';
        document.getElementById('seccion-pago').style.display = 'block';

        // Cambiar el estilo del stepper (Barra de progreso)
        // Envío pasa a ser "completado"
        document.getElementById('stepper-envio').classList.remove('active');
        document.getElementById('stepper-envio').classList.add('completed');
        document.getElementById('icon-envio').outerHTML = '<i class="fa-solid fa-circle-check" id="icon-envio"></i>';
        
        // Pago pasa a ser "activo"
        document.getElementById('stepper-pago').classList.add('active');
    };

    // Función para regresar a la pestaña de Envío (por si se equivocó)
    window.volverAEnvio = function() {
        document.getElementById('seccion-pago').style.display = 'none';
        document.getElementById('seccion-envio').style.display = 'block';

        // Revertir el estilo del stepper
        document.getElementById('stepper-envio').classList.remove('completed');
        document.getElementById('stepper-envio').classList.add('active');
        document.getElementById('icon-envio').outerHTML = '<div class="step-number" id="icon-envio">2</div>';
        
        document.getElementById('stepper-pago').classList.remove('active');
    };

    // Acción Final
    window.finalizarPedido = function() {
        if(carrito.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }
        
        const documento = document.getElementById('in-documento').value.trim();
        if(!documento) {
            alert("Por favor, ingresa tu NIT o CC para la facturación.");
            return;
        }

        alert("¡Pedido realizado con éxito! En breve recibirás un correo con las instrucciones.");
        // Opcional: vaciar carrito y redirigir
        // localStorage.removeItem('carritoAgro');
        // window.location.href = 'index.html'; 
    };

});