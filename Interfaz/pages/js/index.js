document.addEventListener("DOMContentLoaded", function() {
    const slides = document.querySelectorAll(".slide");
    const btnNext = document.querySelector(".right");
    const btnPrev = document.querySelector(".left");
    let current = 0;
    let interval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove("active"));
        if(slides[index]) slides[index].classList.add("active");
    }
    function nextSlide() {
        if(slides.length > 0) {
            current = (current + 1) % slides.length;
            showSlide(current);
        }
    }
    function prevSlide() {
        if(slides.length > 0) {
            current = (current - 1 + slides.length) % slides.length;
            showSlide(current);
        }
    }

    if(btnNext && btnPrev) {
        btnNext.addEventListener("click", () => { nextSlide(); resetAutoSlide(); });
        btnPrev.addEventListener("click", () => { prevSlide(); resetAutoSlide(); });
    }

    function startAutoSlide() {
        if(slides.length > 0) interval = setInterval(nextSlide, 4000);
    }
    function resetAutoSlide() {
        clearInterval(interval);
        startAutoSlide();
    }
    startAutoSlide();
});

window.addEventListener('DOMContentLoaded', function() {
    // 1. Recepción de datos de login
    const parametrosUrl = new URLSearchParams(window.location.search);
    if (parametrosUrl.get('login') === 'true') {
      localStorage.setItem('sesionIniciada', 'true');
      localStorage.setItem('nombreUsuario', parametrosUrl.get('nombre'));
      // ¡Esta es la línea clave que faltaba! 👇
      localStorage.setItem('userEmail', parametrosUrl.get('email')); 
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const sesionIniciada = localStorage.getItem('sesionIniciada');
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    const btnLogin = document.getElementById('btn-login');

    if (sesionIniciada === 'true' && btnLogin) {
   
        
// --- MENÚ DE PERFIL ---

// 1. Inyectamos los estilos CSS para el menú (esto permite usar hover y animaciones)
const estilosMenu = `
<style>
  .user-menu-container {
    position: relative;
    display: inline-block;
    font-family: 'Segoe UI', Roboto, sans-serif;
  }
  .user-menu-btn {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    cursor: pointer;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 14px 6px 6px;
    border-radius: 30px;
    transition: all 0.2s ease;
  }
  .user-menu-btn:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
  }
  .user-avatar-mini {
    width: 32px;
    height: 32px;
    background-color: #236c2f;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.95rem;
  }
  .user-name-text {
    font-weight: 500;
    font-size: 0.95rem;
  }
  .user-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background-color: #ffffff;
    min-width: 220px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    z-index: 1000;
    text-align: left;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .user-dropdown.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  .dropdown-item {
    padding: 12px 20px;
    text-decoration: none;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.95rem;
    font-weight: 500;
    transition: background 0.2s;
  }
  .dropdown-item:hover {
    background-color: #f0fdf4; /* Verde muy claro al pasar el mouse */
    color: #166534;
  }
  .dropdown-divider {
    height: 1px;
    background-color: #f1f5f9;
    margin: 4px 0;
  }
  .dropdown-logout {
    color: #dc2626;
  }
  .dropdown-logout:hover {
    background-color: #fef2f2; /* Rojo muy claro al pasar el mouse */
    color: #b91c1c;
  }
  .dropdown-icon {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
</style>
`;

// Extraemos la inicial del nombre para el Avatar
const inicial = nombreUsuario ? nombreUsuario.charAt(0).toUpperCase() : 'U';

// 2. Reemplazamos el botón de login por la nueva estructura
btnLogin.outerHTML = `
  ${estilosMenu}
  <div class="user-menu-container" id="user-menu-wrapper">
    <button id="btn-user-menu" class="user-menu-btn">
      <div class="user-avatar-mini">${inicial}</div>
      <span class="user-name-text">${nombreUsuario}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
    
    <div id="dropdown-menu" class="user-dropdown">
      <div style="padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; margin-bottom: 4px;">
        <p style="margin: 0; font-size: 0.8rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Cuenta</p>
      </div>

      <a href="pages/Usuario-Comprador/Usuario_Comprador.html" class="dropdown-item">
        <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        Mi Perfil
      </a>
      
      <a href="pages/Usuario-Comprador/Usuario-Comprador.htm" class="dropdown-item">
        <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        Configuración
      </a>
      
      <div class="dropdown-divider"></div>
      
      <a href="#" id="btn-logout" class="dropdown-item dropdown-logout">
        <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        Cerrar Sesión
      </a>
    </div>
  </div>
`;

// 3. Lógica para abrir/cerrar el menú
const btnUserMenu = document.getElementById('btn-user-menu');
const dropdownMenu = document.getElementById('dropdown-menu');
const wrapper = document.getElementById('user-menu-wrapper');

// Alternar menú al hacer clic en el botón
btnUserMenu.addEventListener('click', function(e) {
  e.stopPropagation(); // Evita que el clic se propague al window
  dropdownMenu.classList.toggle('show');
});

// Cerrar el menú si se hace clic afuera
window.addEventListener('click', function(e) {
  if (!wrapper.contains(e.target)) {
    dropdownMenu.classList.remove('show');
  }
});

// 4. Lógica de Cerrar Sesión
document.getElementById('btn-logout').addEventListener('click', function(e) {
  e.preventDefault();
  localStorage.removeItem('sesionIniciada');
  localStorage.removeItem('nombreUsuario');
  localStorage.removeItem('carritoAgro'); 
  window.location.reload(); 
});
      // --- ESTRUCTURA DEL CARRITO FLOTANTE ---
      const carritoHTML = `
        <button id="btn-flotante-carrito" style="position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; border-radius: 50%; background-color: #1e7b36; color: white; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 22px; cursor: pointer; z-index: 9998; display: flex; justify-content: center; align-items: center;">
            <i class="fa-solid fa-cart-shopping"></i>
            <span id="badge-carrito" style="position: absolute; top: -5px; right: -5px; background: red; color: white; font-size: 12px; width: 22px; height: 22px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; border: 2px solid white;">0</span>
        </button>

        <div id="overlay-carrito" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 9998; backdrop-filter: blur(2px);"></div>

        <div id="sidebar-carrito" style="position: fixed; top: 0; right: -450px; width: 380px; max-width: 100%; height: 100vh; background-color: white; box-shadow: -4px 0 15px rgba(0,0,0,0.1); z-index: 9999; transition: right 0.4s ease-in-out; display: flex; flex-direction: column; font-family: sans-serif;">
            
            <div style="padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 24px; color: #333;">Carrito</h2>
                <button onclick="cerrarCarrito()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #555;">✕</button>
            </div>

            <div id="lista-productos-carrito" style="flex-grow: 1; overflow-y: auto; padding: 20px;"></div>

            <div style="padding: 20px; border-top: 1px solid #eee; background: #fff;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #555;">
                    <span>Subtotal</span><span id="subtotal-carrito">$0</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px; color: #555;">
                    <span>Envío</span><span id="envio-carrito">$7.900</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 18px; font-weight: bold; color: #333;">
                    <span>Total</span><span id="total-carrito">$0</span>
               </div>
               
               <button onclick="window.location.href='pages/Carrito/carrito.html'" style="width: 100%; padding: 14px; background-color: #1e7b36; color: white; border: none; border-radius: 30px; font-weight: bold; font-size: 15px; cursor: pointer; margin-bottom: 12px;">Finalizar tu compra</button>
               <button onclick="cerrarCarrito()" style="width: 100%; padding: 14px; background-color: white; color: #1e7b36; border: 1px solid #1e7b36; border-radius: 30px; font-weight: bold; font-size: 15px; cursor: pointer;">Continuar comprando</button>
            </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', carritoHTML);

      // ---LÓGICA FUNCIONAL DEL CARRITO ---
      let carrito = JSON.parse(localStorage.getItem('carritoAgro')) || [];
      const costoEnvio = 7900;

      window.renderizarCarrito = function() {
        const contenedor = document.getElementById('lista-productos-carrito');
        const badge = document.getElementById('badge-carrito');
        let subtotal = 0;
        contenedor.innerHTML = '';

        if(carrito.length === 0) {
            contenedor.innerHTML = '<p style="text-align:center; color:#888; margin-top:50px;">Tu carrito está vacío 🌾</p>';
        }

        carrito.forEach((prod, index) => {
            subtotal += prod.precio * prod.cantidad;
            contenedor.innerHTML += `
                <div style="display: flex; gap: 15px; margin-bottom: 25px; align-items: center;">
                    <img src="${prod.imagen}" style="width: 65px; height: 65px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;">
                    <div style="flex-grow: 1;">
                        <div style="display: flex; justify-content: space-between;">
                            <p style="margin: 0; font-size: 10px; color: #888; text-transform: uppercase;">${prod.marca}</p>
                            <button onclick="eliminarItem(${index})" style="background: none; border: none; color: #a1a1aa; cursor: pointer;"><i class="fa-regular fa-trash-can"></i></button>
                        </div>
                        <p style="margin: 4px 0; font-size: 14px; color: #333; font-weight: 500;">${prod.nombre}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                            <input type="number" value="${prod.cantidad}" min="1" max="${prod.stock}" onchange="cambiarCantidad(${index}, this.value)" style="width: 50px; padding: 4px; border-radius: 8px; border: 1px solid #ccc; text-align: center;">
                            <span style="color: #1e7b36; font-weight: bold; font-size: 15px;">$${(prod.precio * prod.cantidad).toLocaleString('es-CO')}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        badge.innerText = carrito.length;
        document.getElementById('subtotal-carrito').innerText = '$' + subtotal.toLocaleString('es-CO');
        document.getElementById('total-carrito').innerText = '$' + (carrito.length > 0 ? (subtotal + costoEnvio) : 0).toLocaleString('es-CO');
        localStorage.setItem('carritoAgro', JSON.stringify(carrito));
      }

      window.abrirCarrito = () => {
          document.getElementById('sidebar-carrito').style.right = '0';
          document.getElementById('overlay-carrito').style.display = 'block';
          document.body.style.overflow = 'hidden';
      };

      window.cerrarCarrito = () => {
          document.getElementById('sidebar-carrito').style.right = '-450px';
          document.getElementById('overlay-carrito').style.display = 'none';
          document.body.style.overflow = 'auto';
      };

      window.eliminarItem = (index) => {
          carrito.splice(index, 1);
          renderizarCarrito();
      };

      window.cambiarCantidad = (index, nuevaCantidad) => {
          let cantidad = parseInt(nuevaCantidad);
          if (cantidad > carrito[index].stock) {
              alert('¡Uy! Solo hay ' + carrito[index].stock + ' unidades en existencia.');
              cantidad = carrito[index].stock;
          }
          if (cantidad < 1) cantidad = 1;
          carrito[index].cantidad = cantidad;
          renderizarCarrito();
      };

      window.agregarAlCarrito = (id, marca, nombre, precio, imagen, stockMaximo) => {
          carrito = JSON.parse(localStorage.getItem('carritoAgro')) || [];
          
          let itemExistente = carrito.find(item => item.id === id);
          
          if (itemExistente) {
              if (itemExistente.cantidad < stockMaximo) {
                  itemExistente.cantidad++;
              } else {
                  alert('Has alcanzado el límite de stock para este producto.');
                  return;
              }
          } else {
              carrito.push({ id, marca, nombre, precio, imagen, stock: stockMaximo, cantidad: 1 });
          }
          
          renderizarCarrito();
          abrirCarrito();
      };

      document.getElementById('btn-flotante-carrito').addEventListener('click', abrirCarrito);
      document.getElementById('overlay-carrito').addEventListener('click', cerrarCarrito);

      renderizarCarrito();
    }
  });