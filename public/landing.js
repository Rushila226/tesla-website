
// Landing page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupNavigation();
});

function initializeAuth() {
    let currentUser = null;
    let authToken = localStorage.getItem('authToken');

    // Check auth status
    if (authToken) {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateAuthUI();
        }
    }

    // Setup event listeners
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

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });

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
}

function setupNavigation() {
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
