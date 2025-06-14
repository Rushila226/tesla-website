
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'tesla-inspired-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage (replace with database in production)
const users = [];
const orders = [];

// Sample product data
const products = [
  {
    id: 1,
    name: 'Model X Elite',
    type: 'car',
    price: 7500000, // Price in rupees
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800'
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
    id: 2,
    name: 'Model S Pro',
    type: 'car',
    price: 8500000,
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
    description: 'High-performance luxury sedan'
  },
  {
    id: 3,
    name: 'Solar Panel Pro',
    type: 'energy',
    price: 350000,
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'
    ],
    specs: {
      power: '400W per panel',
      efficiency: '22.8%',
      warranty: '25 years',
      coverage: '2m x 1m'
    },
    description: 'Advanced solar panels for sustainable energy'
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      name
    };
    
    users.push(user);
    
    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

app.post('/api/orders', authenticateToken, (req, res) => {
  try {
    const { productId, customizations } = req.body;
    
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const order = {
      id: orders.length + 1,
      userId: req.user.id,
      productId: parseInt(productId),
      customizations: customizations || {},
      price: product.price,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    orders.push(order);
    
    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const userOrders = orders.filter(o => o.userId === req.user.id);
  res.json(userOrders);
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
