
// Global variables
let currentUser = null;
let authToken = localStorage.getItem('authToken');
let products = [];
let currentProductImages = [];
let currentImageIndex = 0;

// Sample product data (moved from backend)
const sampleProducts = [
  {
    id: 1,
    name: 'Model S',
    type: 'car',
    price: 8500000, // Price in rupees
    images: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800',
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800'
    ],
    specs: {
      range: '628 km',
      acceleration: '2.1s 0-100',
      topSpeed: '322 km/h',
      seating: '5 seats'
    },
    description: 'Flagship luxury sedan with tri-motor all-wheel drive'
  },
  {
    id: 2,
    name: 'Model 3',
    type: 'car',
    price: 4500000,
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800'
    ],
    specs: {
      range: '568 km',
      acceleration: '3.1s 0-100',
      topSpeed: '261 km/h',
      seating: '5 seats'
    },
    description: 'Mid-size luxury sedan with exceptional performance'
  },
  {
    id: 3,
    name: 'Model X',
    type: 'car',
    price: 7500000,
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      'https://images.unsplash.com/photo-1549399297-8fe8de03c5b0?w=800'
    ],
    specs: {
      range: '520 km',
      acceleration: '3.8s 0-100',
      topSpeed: '250 km/h',
      seating: '7 seats'
    },
    description: 'Premium electric SUV with falcon wing doors'
  },
  {
    id: 4,
    name: 'Model Y',
    type: 'car',
    price: 5500000,
    images: [
      'https://images.unsplash.com/photo-1605515298946-d062f2e9cd14?w=800',
      'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800'
    ],
    specs: {
      range: '525 km',
      acceleration: '3.5s 0-100',
      topSpeed: '241 km/h',
      seating: '7 seats'
    },
    description: 'Compact SUV with maximum utility and safety'
  }
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadProducts();
    checkAuthStatus();
});

function initializeApp() {
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
}

function setupEventListeners() {
    // Auth modal
    const authLink = document.getElementById('auth-link');
    const authModal = document.getElementById('auth-modal');
    const authClose = document.getElementById('auth-close');
    
    authLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
            logout();
        } else {
            authModal.style.display = 'block';
        }
    });
    
    authClose.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    // Auth tabs
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.dataset.tab;
            switchAuthTab(tabType);
        });
    });

    // Auth forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);

    // Product modal
    const productModal = document.getElementById('product-modal');
    const modalClose = productModal.querySelector('.close');
    
    modalClose.addEventListener('click', () => {
        productModal.style.display = 'none';
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
        if (e.target === productModal) {
            productModal.style.display = 'none';
        }
    });
}

function loadProducts() {
    // Use local data instead of API call
    products = sampleProducts;
    displayProducts();
}

function displayProducts() {
    const productsGrid = document.getElementById('products-grid');
    
    productsGrid.innerHTML = '';

    products.forEach(product => {
        if (product.type === 'car') {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        }
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => openProductModal(product.id);
    
    card.innerHTML = `
        <img src="${product.images[0]}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3>${product.name}</h3>
            <div class="product-price">₹${product.price.toLocaleString()}</div>
            <p>${product.description}</p>
            <div class="product-specs">
                ${Object.entries(product.specs).slice(0, 4).map(([key, value]) => `
                    <div class="spec-item">
                        <span class="spec-label">${key}</span>
                        <span class="spec-value">${value}</span>
                    </div>
                `).join('')}
            </div>
            <button class="cta-button" onclick="event.stopPropagation(); openProductModal(${product.id})">Learn More</button>
        </div>
    `;
    
    return card;
}

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProductImages = product.images;
    currentImageIndex = 0;

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="product-carousel">
            <div class="carousel-container">
                ${product.images.map((img, index) => `
                    <img src="${img}" alt="${product.name}" class="carousel-image ${index === 0 ? 'active' : ''}">
                `).join('')}
            </div>
            ${product.images.length > 1 ? `
                <div class="carousel-nav">
                    ${product.images.map((_, index) => `
                        <div class="carousel-dot ${index === 0 ? 'active' : ''}" onclick="changeCarouselImage(${index})"></div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        
        <div class="product-details">
            <h2>${product.name}</h2>
            <div class="product-price-large">₹${product.price.toLocaleString()}</div>
            <p>${product.description}</p>
            
            <div class="specs-grid">
                ${Object.entries(product.specs).map(([key, value]) => `
                    <div class="spec-item">
                        <span class="spec-label">${key}</span>
                        <span class="spec-value">${value}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="customize-section">
                <h3>Customize Your ${product.name}</h3>
                <div class="customize-option">
                    <label for="color">Color:</label>
                    <select id="color">
                        <option value="white">Pearl White</option>
                        <option value="black">Midnight Black</option>
                        <option value="blue">Deep Blue Metallic</option>
                        <option value="red">Red Multi-Coat</option>
                    </select>
                </div>
                
                ${product.type === 'car' ? `
                    <div class="customize-option">
                        <label for="interior">Interior:</label>
                        <select id="interior">
                            <option value="black">All Black</option>
                            <option value="white">Black and White</option>
                            <option value="cream">Cream</option>
                        </select>
                    </div>
                    
                    <div class="customize-option">
                        <label for="wheels">Wheels:</label>
                        <select id="wheels">
                            <option value="standard">19" Gemini Wheels</option>
                            <option value="sport">21" Turbine Wheels</option>
                            <option value="performance">21" Überturbine Wheels</option>
                        </select>
                    </div>
                ` : ''}
                
                <div class="customize-option">
                    <label for="quantity">Quantity:</label>
                    <input type="number" id="quantity" value="1" min="1" max="10">
                </div>
            </div>
            
            <button class="order-button" onclick="placeOrder(${product.id})">
                ${currentUser ? 'Place Order' : 'Login to Order'}
            </button>
        </div>
    `;
    
    document.getElementById('product-modal').style.display = 'block';
}

function changeCarouselImage(index) {
    const images = document.querySelectorAll('.carousel-image');
    const dots = document.querySelectorAll('.carousel-dot');
    
    images[currentImageIndex].classList.remove('active');
    dots[currentImageIndex].classList.remove('active');
    
    currentImageIndex = index;
    
    images[currentImageIndex].classList.add('active');
    dots[currentImageIndex].classList.add('active');
}

function switchAuthTab(tabType) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    forms.forEach(form => form.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');
    document.getElementById(`${tabType}-form`).classList.add('active');
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        authToken = 'local-token-' + Date.now();
        currentUser = { id: user.id, email: user.email, name: user.name };
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showMessage(messageEl, 'Login successful', 'success');
        updateAuthUI();
        
        setTimeout(() => {
            document.getElementById('auth-modal').style.display = 'none';
        }, 1500);
    } else {
        showMessage(messageEl, 'Invalid credentials', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const messageEl = document.getElementById('signup-message');
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
        showMessage(messageEl, 'User already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: users.length + 1,
        email,
        password, // In real app, this should be hashed
        name
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    authToken = 'local-token-' + Date.now();
    currentUser = { id: newUser.id, email: newUser.email, name: newUser.name };
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showMessage(messageEl, 'Account created successfully', 'success');
    updateAuthUI();
    
    setTimeout(() => {
        document.getElementById('auth-modal').style.display = 'none';
    }, 1500);
}

function placeOrder(productId) {
    if (!currentUser) {
        document.getElementById('auth-modal').style.display = 'block';
        return;
    }
    
    const product = products.find(p => p.id === productId);
    const customizations = {
        color: document.getElementById('color')?.value,
        interior: document.getElementById('interior')?.value,
        wheels: document.getElementById('wheels')?.value,
        quantity: document.getElementById('quantity')?.value || 1
    };
    
    // Store order in localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = {
        id: orders.length + 1,
        userId: currentUser.id,
        productId: productId,
        productName: product.name,
        customizations: customizations,
        price: product.price,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    showNotification('Order placed successfully!');
    document.getElementById('product-modal').style.display = 'none';
}

function checkAuthStatus() {
    if (authToken) {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateAuthUI();
        }
    }
}

function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    if (currentUser) {
        authLink.textContent = 'Logout';
        authLink.title = `Logged in as ${currentUser.name}`;
    } else {
        authLink.textContent = 'Login';
        authLink.title = '';
    }
}

function logout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showNotification('Logged out successfully!');
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `auth-message ${type}`;
    element.style.display = 'block';
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Smooth scrolling for navigation links
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('nav-link') && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});
