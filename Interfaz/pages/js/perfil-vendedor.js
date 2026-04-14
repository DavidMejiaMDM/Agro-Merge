// ==========================================
// LÓGICA DE PERFIL VENDEDOR - PASO 1
// ==========================================

let products = [];
let productIdCounter = 0;

// Escuchar cambios y configurar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('productModal');
    const fileInput = document.getElementById('productImage');
    const fileUpload = document.querySelector('.file-upload');

    // Hacer clickeable la zona de carga de archivo
    if (fileUpload) {
        fileUpload.addEventListener('click', function() {
            fileInput.click();
        });
    }

    // Cerrar modal al hacer clic fuera del contenido
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    // Actualizar preview de imagen al seleccionar un archivo
    if (fileInput) {
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            const fileName = document.getElementById('fileName');
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');

            if (file) {
                fileName.textContent = file.name;
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                fileName.textContent = 'Selecciona una imagen';
                preview.style.display = 'none';
            }
        });
    }

    // Inicializar la vista de productos al cargar
    renderProducts();
});

// Función para abrir el modal y limpiar el formulario
function openModal() {
    document.getElementById('productModal').style.display = 'flex';
    document.getElementById('productName').focus();
    
    // Limpiar el formulario
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productQuantity').value = '';
    document.getElementById('productUnit').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('fileName').textContent = 'Selecciona una imagen';
    document.getElementById('imagePreview').style.display = 'none';
}

// Función para cerrar el modal
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Función para procesar y agregar el producto al array
function addProduct(event) {
    event.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const unit = document.getElementById('productUnit').value;
    const imageInput = document.getElementById('productImage');

    if (!imageInput.files[0]) {
        alert('Por favor selecciona una imagen');
        return;
    }

    if (name && price >= 0 && quantity >= 0 && unit) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const product = {
                id: productIdCounter++,
                name: name,
                description: description,
                price: price,
                quantity: quantity,
                unit: unit,
                image: e.target.result
            };

            products.push(product);
            renderProducts();
            closeModal();
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        alert('Por favor completa todos los campos obligatorios correctamente');
    }
}

// Función para eliminar un producto
function deleteProduct(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        products = products.filter(p => p.id !== id);
        renderProducts();
    }
}

// Función para pintar las tarjetas de los productos en la interfaz
function renderProducts() {
    const container = document.getElementById('productsContainer');
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 24px;">Aún no has agregado productos</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-card__image">
                <img src="${product.image}" alt="${product.name}" />
            </div>
            <div class="product-card__content">
                <h3 class="product-card__name">${product.name}</h3>
                ${product.description ? `<p class="product-card__description">${product.description}</p>` : ''}
                <div class="product-card__info">
                    <span class="product-card__price">$${product.price.toLocaleString('es-CO')}</span>
                    <span class="product-card__quantity">${product.quantity} ${product.unit}</span>
                </div>
            </div>
            <button 
                class="product-card__delete" 
                onclick="deleteProduct(${product.id})"
                title="Eliminar producto"
            >
                ✕
            </button>
        </div>
    `).join('');
}

// Función para validar y pasar al siguiente paso
function goToStep2() {
    if (products.length > 0) {
        // Guardar productos en sessionStorage para acceder desde la siguiente página
        sessionStorage.setItem('products', JSON.stringify(products));
        window.location.href = 'vendedor-perfil-2.html';
    } else {
        alert('Por favor agrega al menos un producto');
    }
}