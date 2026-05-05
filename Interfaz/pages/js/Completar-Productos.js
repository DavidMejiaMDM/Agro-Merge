document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos todas las pastillas de productos, EXCEPTO el botón de "Añadir"
    const productPills = document.querySelectorAll('.product-pill:not(.add-btn)');
    const continueBtn = document.querySelector('.continue-btn');
    const addBtn = document.querySelector('.add-btn');

    // 1. Lógica para seleccionar/deseleccionar productos
    productPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.preventDefault(); // IMPORTANTE: Evita que el botón intente recargar la página

            // Alterna la clase 'selected'
            pill.classList.toggle('selected');
            
            // Mensaje en consola para comprobar que funciona internamente
            console.log(`Has hecho clic en: ${pill.textContent.trim()} | ¿Seleccionado?: ${pill.classList.contains('selected')}`);
        });
    });

    // 2. Función para obtener la lista de los textos de los productos seleccionados
    const obtenerProductosSeleccionados = () => {
        const selectedPills = document.querySelectorAll('.product-pill.selected:not(.add-btn)');
        return Array.from(selectedPills).map(pill => pill.textContent.trim());
    };

    // 3. Lógica del botón CONTINUAR
    if (continueBtn) {
        continueBtn.addEventListener('click', async (e) => {
            e.preventDefault(); 

            const productosElegidos = obtenerProductosSeleccionados();

            // VALIDACIÓN: Mínimo 3 productos
            if (productosElegidos.length < 3) {
                alert(`⚠️ Por favor, selecciona al menos 3 productos para continuar.\nLlevas seleccionados: ${productosElegidos.length}`);
                return; 
            }

            console.log("Datos listos para enviar al servidor:", productosElegidos);

            try {
                // Mensaje temporal para probar que funciona
                alert(' Has seleccionado: ' + productosElegidos.join(', '));

                /* ========================================================================
                   AQUÍ IRÁ TU FETCH A SERVER.JS CUANDO LO CONECTES
                   ======================================================================== */
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    // 4. Lógica EXTRA: Botón de "Añadir" otro producto
    if (addBtn) {
        addBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar recargas
            const nuevoProducto = prompt("Escribe el nombre de tu producto:");
            
            if (nuevoProducto && nuevoProducto.trim() !== "") {
                const newPill = document.createElement('button');
                newPill.className = 'product-pill selected'; 
                newPill.textContent = nuevoProducto.trim();
                
                newPill.addEventListener('click', (eventoPill) => {
                    eventoPill.preventDefault();
                    newPill.classList.toggle('selected');
                });

                addBtn.parentNode.insertBefore(newPill, addBtn);
            }
        });
    }
});