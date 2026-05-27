document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://localhost:3000';
    const form = document.getElementById('formulario_producto');
    const inputNombre = document.getElementById('nombre_producto');
    const inputPrecio = document.getElementById('precio');
    const selectTipoVenta = document.getElementById('tipo_venta');
    const inputImagenOculto = document.getElementById('input_imagen_oculto');
    const btnSubirImagen = document.getElementById('btn_subir_imagen');
    const textoBtnImagen = document.getElementById('texto_btn_imagen');
    const btnAnadirExtra = document.getElementById('btn_anadir_extra');

    let ultimaImagenSeleccionada = null;

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

        const cookie = document.cookie.match(/(?:^|;\s*)agro_email=([^;]*)/);
        if (cookie && cookie[1]) {
            const emailCookie = decodeURIComponent(cookie[1]).trim().toLowerCase();
            if (emailCookie) {
                localStorage.setItem('emailRegistroVendedor', emailCookie);
                localStorage.setItem('usuario_email', emailCookie);
                localStorage.setItem('userEmail', emailCookie);
                try { sessionStorage.setItem('emailRegistroVendedor', emailCookie); } catch (_) {}
                return emailCookie;
            }
        }

        return (
            localStorage.getItem('emailRegistroVendedor') ||
            localStorage.getItem('usuario_email') ||
            localStorage.getItem('userEmail') ||
            sessionStorage.getItem('emailRegistroVendedor') ||
            ''
        ).trim().toLowerCase();
    }

    inputNombre.addEventListener('input', function () {
        this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    });

    inputPrecio.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    btnSubirImagen.addEventListener('click', () => inputImagenOculto.click());

    inputImagenOculto.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            ultimaImagenSeleccionada = this.files[0];
            textoBtnImagen.textContent = this.files[0].name;
            btnSubirImagen.querySelector('i').style.color = '#4caf50';
        } else {
            ultimaImagenSeleccionada = null;
            textoBtnImagen.textContent = 'Subir imagen';
            btnSubirImagen.querySelector('i').style.color = '';
        }
    });

    function validarCampos() {
        if (!inputNombre.value.trim()) return alert('⚠️ Ingresa el nombre del producto.'), false;
        if (!inputPrecio.value.trim()) return alert('⚠️ Ingresa el precio del producto.'), false;
        if (!selectTipoVenta.value) return alert('⚠️ Selecciona el tipo de venta.'), false;
        if (!ultimaImagenSeleccionada) return alert('⚠️ Por favor, sube una foto del producto.'), false;
        return true;
    }

    async function guardarProductoEnServidor() {
        const emailProceso = obtenerEmailProceso();
        if (!emailProceso) {
            return { ok: false, data: { mensaje: 'No se encontró el correo del proceso de registro.' } };
        }

        const formData = new FormData();
        formData.append('nombre', inputNombre.value.trim());
        formData.append('precio', inputPrecio.value.trim());
        formData.append('tipo_venta', selectTipoVenta.value);
        formData.append('email_usuario', emailProceso);
        formData.append('imagen_producto', ultimaImagenSeleccionada);

        const response = await fetch(`${API_BASE}/api/productos/agregar`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        return { ok: response.ok, data };
    }

    function resetearFormulario() {
        form.reset();
        ultimaImagenSeleccionada = null;
        textoBtnImagen.textContent = 'Subir imagen';
        btnSubirImagen.querySelector('i').style.color = '';
    }

    btnAnadirExtra.addEventListener('click', async () => {
        if (!validarCampos()) return;

        try {
            const resultado = await guardarProductoEnServidor();
            if (!resultado.ok) return alert(`❌ ${resultado.data?.mensaje || 'No se pudo guardar el producto.'}`);

            alert('✅ Producto añadido correctamente.');
            resetearFormulario();
        } catch (error) {
            console.error(error);
            alert('❌ Error de conexión con el servidor.');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validarCampos()) return;

        try {
            const resultado = await guardarProductoEnServidor();
            if (!resultado.ok) return alert(`❌ ${resultado.data?.mensaje || 'No se pudo guardar el producto.'}`);

            alert('Producto guardado correctamente.');
            const emailProceso = obtenerEmailProceso();
            window.location.href =
                `${API_BASE}/pages/Agregar-Productos-Final/Agregar-Productos-Final.html?email=${encodeURIComponent(emailProceso)}`;
        } catch (error) {
            console.error(error);
            alert('❌ Error de conexión con el servidor.');
        }
    });
});