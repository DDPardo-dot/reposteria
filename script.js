// ==========================================================================
// DULCE REPOSTERÍA — Lógica Interactiva (script.js)
// Incluye:
// 1. Filtro de categorías corregido (oculta las demás tarjetas al instante)
// 2. Formularios de Registro e Inicio de Sesión de Usuarios
// 3. Detección automática del Último Postre Pedido y del Postre Que Más Pide
// ==========================================================================

// 1. Mostrar notificación emergente (Toast)
const toast = document.querySelector('#toast');
let toastTimer;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// 2. Menú desplegable para celulares
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('#nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// 3. Filtro de tarjetas de postres por categoría (Corregido con style.display + hidden)
const filterButtons = document.querySelectorAll('.filter-chip');
const productCards = document.querySelectorAll('.product-card');
const catalogCount = document.querySelector('#catalog-count');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedCategory = button.dataset.category;

    // Marcar botón activo
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    // Mostrar únicamente los postres de la categoría seleccionada y ocultar el resto
    let visibleCount = 0;
    productCards.forEach((card) => {
      const matches = selectedCategory === 'todos' || card.dataset.category === selectedCategory;
      card.hidden = !matches;
      card.classList.toggle('is-hidden', !matches);
      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount += 1;
    });

    if (catalogCount) {
      catalogCount.textContent = `Mostrando ${visibleCount} postres`;
    }
  });
});

// 4. Sistema de Usuarios Registrados e Historial de Postres
const DEFAULT_USERS = {
  'valentina@colegio.edu': {
    name: 'Valentina Gómez',
    email: 'valentina@colegio.edu',
    phone: '300 412 8890',
    password: '123',
    orders: [
      { dessert: 'Brownie de Chocolate', date: '2026-10-15', notes: 'Para compartir en clase' },
      { dessert: 'Brownie de Chocolate', date: '2026-10-22', notes: 'Porción extra de chocolate' },
      { dessert: 'Flan Casero', date: '2026-11-02', notes: 'Postre de fin de semana' }
    ]
  },
  'sebastian@colegio.edu': {
    name: 'Sebastián Mejía',
    email: 'sebastian@colegio.edu',
    phone: '315 908 3321',
    password: '123',
    orders: [
      { dessert: 'Galletas Choco-Chips Clásicas', date: '2026-10-18', notes: 'Caja de galletas' },
      { dessert: 'Cupcake de Vainilla', date: '2026-10-28', notes: 'Decorado azul y morado' },
      { dessert: 'Galletas Choco-Chips Clásicas', date: '2026-11-04', notes: 'Recién horneadas' }
    ]
  }
};

let usersDB = JSON.parse(JSON.stringify(DEFAULT_USERS));
let currentUserEmail = 'valentina@colegio.edu';

// Cargar datos guardados en el navegador si existen
try {
  const savedUsers = localStorage.getItem('dulceReposteriaUsers');
  const savedActive = localStorage.getItem('dulceReposteriaActiveUser');
  if (savedUsers) {
    usersDB = JSON.parse(savedUsers);
  }
  if (savedActive && usersDB[savedActive]) {
    currentUserEmail = savedActive;
  }
} catch (err) {
  // Si el navegador bloquea localStorage, funciona en memoria sin errores
}

function saveUsersToStorage() {
  try {
    localStorage.setItem('dulceReposteriaUsers', JSON.stringify(usersDB));
    localStorage.setItem('dulceReposteriaActiveUser', currentUserEmail || '');
  } catch (err) {
    // Continuar en memoria
  }
}

// Función sencilla que detecta cuál es el postre que más pide el usuario
function getMostOrderedDessert(orders) {
  if (!orders || orders.length === 0) {
    return { name: 'Sin pedidos aún', count: 0 };
  }

  const counts = {};
  let topDessert = orders[0].dessert;
  let maxCount = 0;

  orders.forEach((order) => {
    const name = order.dessert;
    counts[name] = (counts[name] || 0) + 1;
    if (counts[name] > maxCount) {
      maxCount = counts[name];
      topDessert = name;
    }
  });

  return { name: topDessert, count: maxCount };
}

// Actualizar en pantalla los datos del usuario, su último postre y el que más pide
function renderUserProfile() {
  const user = usersDB[currentUserEmail];
  const profileName = document.querySelector('#profile-user-name');
  const profileMeta = document.querySelector('#profile-user-meta');
  const lastDessertEl = document.querySelector('#stat-last-dessert');
  const lastDateEl = document.querySelector('#stat-last-date');
  const topDessertEl = document.querySelector('#stat-top-dessert');
  const topCountEl = document.querySelector('#stat-top-count');
  const historyListEl = document.querySelector('#user-history-list');
  const clientNameInput = document.querySelector('#client-name');

  if (!user) return;

  if (profileName) profileName.textContent = user.name;
  if (profileMeta) profileMeta.textContent = `${user.email} · Tel: ${user.phone}`;
  if (clientNameInput) clientNameInput.value = user.name;

  const orders = user.orders || [];

  // 1. Detectar el último postre que pidió
  if (orders.length > 0) {
    const lastOrder = orders[orders.length - 1];
    if (lastDessertEl) lastDessertEl.textContent = lastOrder.dessert;
    if (lastDateEl) lastDateEl.textContent = `Pedido el ${lastOrder.date}`;
  } else {
    if (lastDessertEl) lastDessertEl.textContent = 'Ninguno todavía';
    if (lastDateEl) lastDateEl.textContent = 'Haz tu primer pedido abajo';
  }

  // 2. Detectar el postre que más pide
  const mostOrdered = getMostOrderedDessert(orders);
  if (mostOrdered.count > 0) {
    if (topDessertEl) topDessertEl.textContent = mostOrdered.name;
    if (topCountEl) topCountEl.textContent = `Pedido ${mostOrdered.count} ${mostOrdered.count === 1 ? 'vez' : 'veces'}`;
  } else {
    if (topDessertEl) topDessertEl.textContent = 'Ninguno todavía';
    if (topCountEl) topCountEl.textContent = 'Se calculará con tus pedidos';
  }

  // 3. Mostrar historial de pedidos de este usuario
  if (historyListEl) {
    if (orders.length === 0) {
      historyListEl.innerHTML = `<li class="history-item"><span>Aún no tienes pedidos registrados en esta cuenta.</span></li>`;
    } else {
      historyListEl.innerHTML = [...orders]
        .reverse()
        .map(
          (item) => `
          <li class="history-item">
            <div>
              <strong style="display: block;">${item.dessert}</strong>
              <span style="font-size: 12px; color: var(--text);">${item.notes || 'Pedido estándar'}</span>
            </div>
            <span class="category-badge">${item.date}</span>
          </li>`
        )
        .join('');
    }
  }
}

// Pestañas para alternar entre "Crear Cuenta" e "Iniciar Sesión"
const tabRegisterBtn = document.querySelector('#tab-register-btn');
const tabLoginBtn = document.querySelector('#tab-login-btn');
const registerForm = document.querySelector('#register-form');
const loginForm = document.querySelector('#login-form');

if (tabRegisterBtn && tabLoginBtn && registerForm && loginForm) {
  tabRegisterBtn.addEventListener('click', () => {
    tabRegisterBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
    registerForm.hidden = false;
    loginForm.hidden = true;
  });

  tabLoginBtn.addEventListener('click', () => {
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    loginForm.hidden = false;
    registerForm.hidden = true;
  });
}

// Formulario 1: Registrar un nuevo usuario
if (registerForm) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.querySelector('#reg-name').value.trim();
    const email = document.querySelector('#reg-email').value.trim().toLowerCase();
    const phone = document.querySelector('#reg-phone').value.trim();
    const password = document.querySelector('#reg-password').value.trim();

    if (!name || !email || !phone || !password) {
      showToast('Por favor completa todos los campos de registro.');
      return;
    }

    usersDB[email] = {
      name,
      email,
      phone,
      password,
      orders: []
    };
    currentUserEmail = email;
    saveUsersToStorage();
    renderUserProfile();
    registerForm.reset();
    showToast(`¡Cuenta creada! Bienvenido/a, ${name}`);
  });
}

// Formulario 2: Iniciar sesión con un usuario existente
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.querySelector('#login-email').value.trim().toLowerCase();
    const password = document.querySelector('#login-password').value.trim();

    const foundUser = usersDB[email];
    if (!foundUser) {
      showToast('No encontramos ese correo. Regístrate primero en Crear Cuenta.');
      return;
    }
    if (foundUser.password !== password) {
      showToast('Contraseña incorrecta. (En las cuentas de prueba es 123)');
      return;
    }

    currentUserEmail = email;
    saveUsersToStorage();
    renderUserProfile();
    loginForm.reset();
    showToast(`Sesión iniciada como ${foundUser.name}`);
  });
}

// Botones rápidos para cambiar entre cuentas de demostración en clase
document.querySelectorAll('[data-switch-user]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const email = btn.dataset.switchUser;
    if (usersDB[email]) {
      currentUserEmail = email;
      saveUsersToStorage();
      renderUserProfile();
      showToast(`Cambiaste al perfil de ${usersDB[email].name}`);
    }
  });
});

// Botón para pedir de nuevo el postre favorito con 1 clic
const repeatFavBtn = document.querySelector('#repeat-fav-btn');
const dessertSelect = document.querySelector('#client-dessert');

if (repeatFavBtn) {
  repeatFavBtn.addEventListener('click', () => {
    const user = usersDB[currentUserEmail];
    if (!user || !user.orders || user.orders.length === 0) {
      showToast('Haz primero un pedido para detectar tu postre favorito.');
      return;
    }
    const fav = getMostOrderedDessert(user.orders);
    if (dessertSelect && fav.count > 0) {
      dessertSelect.value = fav.name;
      const orderSection = document.querySelector('#encargos');
      if (orderSection) orderSection.scrollIntoView({ behavior: 'smooth' });
      showToast(`Listo para repetir tu favorito: ${fav.name}`);
    }
  });
}

// 5. Información de ingredientes para la ventana modal
const ingredientsByDessert = {
  'Galletas Choco-Chips Clásicas': [
    'Harina de trigo pastelera y mantequilla fresca',
    'Azúcar morena y azúcar blanca',
    'Chispas de chocolate semiamargo',
    'Esencia natural de vainilla'
  ],
  'Galletas de Vainilla': [
    'Masa casera suave de mantequilla',
    'Extracto de vainilla natural',
    'Glaseado dulce sencillo decorado a mano'
  ],
  'Brownie de Chocolate': [
    'Chocolate semiamargo derretido y cacao puro',
    'Mantequilla y huevos frescos',
    'Horneado con textura suave por dentro'
  ],
  'Brownie con Arequipe': [
    'Base de brownie de chocolate casero',
    'Cubierta generosa de arequipe tradicional',
    'Toque de cacao en polvo'
  ],
  'Cupcake de Vainilla': [
    'Ponqué esponjoso de vainilla horneado en casa',
    'Crema suave batida en tonos pastel',
    'Chispitas dulces decorativas'
  ],
  'Cupcake de Chocolate': [
    'Ponqué húmedo de cacao',
    'Crema batida de vainilla y chocolate',
    'Trocitos de chocolate por encima'
  ],
  'Flan Casero': [
    'Leche entera y leche condensada',
    'Huevos frescos y esencia de vainilla',
    'Baño de caramelo dorado hecho en casa'
  ],
  'Mini Tartaletas Dulces': [
    'Base crujiente de galleta horneada',
    'Relleno de crema pastelera casera',
    'Fruta fresca picada por encima'
  ]
};

const modal = document.querySelector('#detail-modal');
const modalTitle = document.querySelector('#modal-dessert-title');
const modalList = document.querySelector('#modal-ingredients-list');
const modalSelectBtn = document.querySelector('#modal-select-btn');
const closeModalBtn = document.querySelector('#close-detail-btn');

let currentDessertName = '';

function openDessertModal(dessertName) {
  currentDessertName = dessertName;
  const list = ingredientsByDessert[dessertName] || ['Receta casera preparada bajo pedido.'];

  if (modalTitle) modalTitle.textContent = dessertName;
  if (modalList) {
    modalList.innerHTML = list.map((item) => `<li>${item}</li>`).join('');
  }
  if (modal) modal.hidden = false;
}

function closeDessertModal() {
  if (modal) modal.hidden = true;
}

document.querySelectorAll('[data-dessert]').forEach((btn) => {
  btn.addEventListener('click', () => {
    openDessertModal(btn.dataset.dessert);
  });
});

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeDessertModal);
}

if (modal) {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeDessertModal();
  });
}

if (modalSelectBtn) {
  modalSelectBtn.addEventListener('click', () => {
    if (dessertSelect && currentDessertName) {
      dessertSelect.value = currentDessertName;
    }
    closeDessertModal();
    const orderSection = document.querySelector('#encargos');
    if (orderSection) orderSection.scrollIntoView({ behavior: 'smooth' });
    showToast(`Elegiste: ${currentDessertName}`);
  });
}

// 6. Botones rápidos "Encargar" de cada tarjeta
document.querySelectorAll('[data-order]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const dessertName = btn.dataset.order;
    if (dessertSelect) {
      dessertSelect.value = dessertName;
    }
    const orderSection = document.querySelector('#encargos');
    if (orderSection) orderSection.scrollIntoView({ behavior: 'smooth' });
    showToast(`Listo para encargar: ${dessertName}`);
  });
});

// 7. Formulario de encargos conectado al historial del usuario activo
const orderForm = document.querySelector('#custom-order-form');
const feedbackBox = document.querySelector('#form-feedback-box');

if (orderForm) {
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.querySelector('#client-name').value.trim();
    const dessert = document.querySelector('#client-dessert').value;
    const date = document.querySelector('#client-date').value;
    const notes = document.querySelector('#client-notes').value.trim();

    if (!name || !date) {
      showToast('Por favor completa tu nombre y la fecha de entrega.');
      return;
    }

    // Guardar el pedido en el historial del usuario conectado
    if (currentUserEmail && usersDB[currentUserEmail]) {
      usersDB[currentUserEmail].name = name;
      usersDB[currentUserEmail].orders.push({
        dessert,
        date,
        notes: notes || 'Pedido desde formulario web'
      });
      saveUsersToStorage();
      renderUserProfile();
    }

    const userOrders = currentUserEmail && usersDB[currentUserEmail] ? usersDB[currentUserEmail].orders : [];
    const topDessert = getMostOrderedDessert(userOrders);

    if (feedbackBox) {
      feedbackBox.hidden = false;
      feedbackBox.textContent = `¡Gracias, ${name}! Tu último postre pedido ahora es "${dessert}" (${date}) y el postre que más pides es "${topDessert.name}".`;
    }

    document.querySelector('#client-notes').value = '';
    showToast(`¡Pedido guardado en el historial de ${name}!`);
  });
}

// Inicializar el perfil del usuario al abrir la página
renderUserProfile();
