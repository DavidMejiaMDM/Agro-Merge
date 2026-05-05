document.addEventListener('DOMContentLoaded', () => {
    
    // Referencias a los elementos del DOM
    const form = document.getElementById('formulario_producto');
    const inputNombre = document.getElementById('nombre_producto');
    const inputPrecio = document.getElementById('precio');
    const selectTipoVenta = document.getElementById('tipo_venta');
    
    // Referencias para la imagen
    const inputImagenOculto = document.getElementById('input_imagen_oculto');
    const btnSubirImagen = document.getElementById('btn_subir_imagen');
    const textoBtnImagen = document.getElementById('texto_btn_imagen');

    /* ==========================================
       1. VALIDACIONES EN TIEMPO REAL
    ========================================== */

    // VALIDACIÓN NOMBRE: Solo permite letras y espacios. Borra lo demás al instante.
    inputNombre.addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });

    // VALIDACIÓN PRECIO: Solo permite números. Borra lo demás al instante.
    inputPrecio.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    /* ==========================================
       2. LÓGICA DE SUBIDA DE IMAGEN
    ========================================== */

    // Al hacer clic en el botón bonito, simulamos un clic en el input oculto
    btnSubirImagen.addEventListener('click', () => {
        inputImagenOculto.click();
    });

    // Detectar cuando el usuario seleccionó una foto
    inputImagenOculto.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            // Mostrar el nombre del archivo en el botón
            const nombreArchivo = this.files[0].name;
            textoBtnImagen.textContent = nombreArchivo;
            
            // Poner el icono de color verde para indicar éxito
            btnSubirImagen.querySelector('i').style.color = '#4caf50'; 
        } else {
            // Si cancela, vuelve a la normalidad
            textoBtnImagen.textContent = 'Subir imagen';
            btnSubirImagen.querySelector('i').style.color = '';
        }
    });

    /* ==========================================
       3. ENVÍO DEL FORMULARIO A SERVER.JS
    ========================================== */
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita recargar la página

        // Validar que realmente se haya subido una foto
        if (!inputImagenOculto.files[0]) {
            alert('⚠️ Por favor, sube una foto del producto antes de finalizar.');
            return;
        }

        // Crear FormData para poder enviar el archivo y el texto juntos
        const formData = new FormData();
        formData.append('nombre', inputNombre.value.trim());
        formData.append('precio', inputPrecio.value.trim());
        formData.append('tipo_venta', selectTipoVenta.value);
        formData.append('imagen_producto', inputImagenOculto.files[0]);

        console.log("Datos capturados, listos para enviar al servidor.");

        try {
            // ALERTA DE PRUEBA: Para que veas que funciona antes de conectar el backend
            alert(`✅ ¡Todo correcto!\n\nSe enviará lo siguiente a la base de datos:\nProducto: ${inputNombre.value}\nPrecio: $${inputPrecio.value}\nTipo: ${selectTipoVenta.value}\nImagen: ${inputImagenOculto.files[0].name}`);
            
            /* ===================================================================
            AQUÍ ESTÁ EL FETCH PARA CUANDO TENGAS LA RUTA EN TU SERVER.JS
            ===================================================================
            
            const response = await fetch('http://localhost:3000/api/productos/agregar', {
                method: 'POST',
                body: formData // <-- No lleva Content-Type, FormData lo hace solo
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ Producto guardado exitosamente');
                form.reset(); // Limpia los inputs
                textoBtnImagen.textContent = 'Subir imagen'; // Resetea el botón visual
                btnSubirImagen.querySelector('i').style.color = '';
            } else {
                alert('❌ Error al guardar: ' + data.mensaje);
            }
            */

        } catch (error) {
            console.error('Error al enviar los datos:', error);
            alert('Error de conexión con el servidor.');
        }
    });
});