// ==========================================
// LÓGICA DE LA PÁGINA DEL CARRITO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Leer el carrito almacenado en la memoria del navegador
    let carrito = JSON.parse(localStorage.getItem('carritoAgro')) || [];
    const costoEnvio = 7900;

    const contenedorItems = document.getElementById('contenedor-items-pagina');
    const tituloCantidad = document.getElementById('cantidad-titulos');
    const lblSubtotal = document.getElementById('pagina-subtotal');
    const lblTotal = document.getElementById('pagina-total');

    // 2. Función para renderizar el carrito en la pantalla
    window.renderizarPaginaCarrito = function() {
        contenedorItems.innerHTML = '';
        let subtotal = 0;

        if (carrito.length === 0) {
            contenedorItems.innerHTML = '<p style="text-align:center; padding: 40px; color:#888;">Tu carrito está vacío 🌾</p>';
            tituloCantidad.innerText = '(0 productos)';
            lblSubtotal.innerText = '$0';
            lblTotal.innerText = '$0';
            return;
        }

        let totalProductos = 0;

        carrito.forEach((prod, index) => {
            subtotal += prod.precio * prod.cantidad;
            totalProductos += prod.cantidad;

            contenedorItems.innerHTML += `
                <div class="item-carrito">
                    <div class="info-producto">
                        <img src="${prod.imagen}" alt="${prod.nombre}">
                        <div>
                            <h4>${prod.marca}</h4>
                            <p>${prod.nombre}</p>
                        </div>
                    </div>
                    
                    <div>
                        <div class="control-cantidad">
                            <button onclick="modificarCantidad(${index}, -1)">-</button>
                            <span>${prod.cantidad}</span>
                            <button onclick="modificarCantidad(${index}, 1)">+</button>
                        </div>
                    </div>
                    
                    <div class="precio-total-item">
                        $${(prod.precio * prod.cantidad).toLocaleString('es-CO')}
                    </div>
                    
                    <div>
                        <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        // Actualizar contadores y precios
        tituloCantidad.innerText = `(${totalProductos} productos)`;
        lblSubtotal.innerText = '$' + subtotal.toLocaleString('es-CO');
        lblTotal.innerText = '$' + (subtotal + costoEnvio).toLocaleString('es-CO');
        
        // Guardar los datos
        localStorage.setItem('carritoAgro', JSON.stringify(carrito));
    };

    // 3. Función para sumar o restar cantidad
    window.modificarCantidad = function(index, cambio) {
        let nuevaCantidad = carrito[index].cantidad + cambio;
        
        if (nuevaCantidad > carrito[index].stock) {
            alert(`Solo hay ${carrito[index].stock} unidades disponibles.`);
            return;
        }
        if (nuevaCantidad < 1) {
            nuevaCantidad = 1; // No permitimos que baje a cero con este botón
        }
        
        carrito[index].cantidad = nuevaCantidad;
        renderizarPaginaCarrito();
    };

    // 4. Función para eliminar el producto con el icono de basura
    window.eliminarDelCarrito = function(index) {
        carrito.splice(index, 1);
        renderizarPaginaCarrito();
    };

    // 5. Función para el botón de Pagar - REDIRECCIÓN AL CHECKOUT
    window.procesarPago = function() {
        if(carrito.length === 0) {
            alert("Agrega productos antes de pagar. 🌾");
            return;
        }

        // Redirigimos a la carpeta Checkout (ajusta la ruta según tu estructura)
        // Si tu carpeta Checkout está al mismo nivel que Carrito, sería:
        window.location.href = '../Checkout/checkout.html'; 
    };

    // Ejecutar la visualización al abrir la página
    renderizarPaginaCarrito();
});