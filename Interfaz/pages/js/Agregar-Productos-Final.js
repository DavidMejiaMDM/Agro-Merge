document.addEventListener('DOMContentLoaded', () => {
    const contenedorProductos = document.getElementById('contenedor-productos');
    const btnAnadir = document.getElementById('btn_anadir_mas');
    const btnContinuar = document.getElementById('btn_continuar');

    // 1. Leer los productos desde LocalStorage
    // (En la pantalla anterior debes guardarlos con este nombre)
    let productosGuardados = JSON.parse(localStorage.getItem('mis_productos_agromerge')) || [];

    // 2. Si no hay productos guardados, simulamos los de tu imagen para que no se vea vacío
    if (productosGuardados.length === 0) {
        productosGuardados = [
            { nombre: 'Maiz dulce', precio: '2,200.00', tipo_venta: 'lb', imagen: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=300&q=80' },
            { nombre: 'Maiz dulce', precio: '2,200.00', tipo_venta: 'lb', imagen: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=300&q=80' },
            { nombre: 'Maiz dulce', precio: '2,200.00', tipo_venta: 'lb', imagen: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=300&q=80' }
        ];
    }

    // 3. Función para renderizar el HTML de las tarjetas
    const renderizarProductos = () => {
        contenedorProductos.innerHTML = ''; // Limpiamos el contenedor

        productosGuardados.forEach(producto => {
            // Creamos la estructura HTML de la tarjeta
            const card = document.createElement('div');
            card.className = 'product-card';

            card.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" class="product-img">
                <div class="product-name">${producto.nombre}</div>
                <div class="product-price">$ ${producto.precio}/${producto.tipo_venta}</div>
            `;

            contenedorProductos.appendChild(card);
        });
    };

    // Renderizamos al cargar la página
    renderizarProductos();

    // 4. Lógica de botones
    btnAnadir.addEventListener('click', () => {
        // Redirigir de vuelta al formulario anterior para agregar otro
        window.location.href = 'agrega-productos.html'; // Cambia por el nombre real de tu archivo
    });

    btnContinuar.addEventListener('click', () => {
        alert('¡Excelente! Inventario confirmado. Pasando al Dashboard del vendedor...');
        // Aquí puedes hacer el window.location.href hacia tu página principal
    });
});