/**
 * JWT Banking API Authentication Demo
 * Main Express server with JWT authentication
 * 
 * API Endpoints:
 * - POST /login: Login to get JWT token
 * - GET /balance: View account balance (protected)
 * - POST /deposit: Deposit money (protected)
 * - POST /withdraw: Withdraw money (protected)
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Hardcoded user credentials (for demo purposes only)
const VALID_USERNAME = 'john_doe';
const VALID_PASSWORD = 'password123';

// In-memory database (for demo purposes)
const userDatabase = {
  'john_doe': {
    password: 'password123',
    balance: 5000
  }
};

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'JWT Banking API is running!',
    endpoints: {
      login: 'POST /login',
      balance: 'GET /balance',
      deposit: 'POST /deposit',
      withdraw: 'POST /withdraw'
    }
  });
});

/**
 * POST /login
 * Login endpoint that returns a JWT token
 * 
 * Request Body:
 * {
 *   "username": "john_doe",
 *   "password": "password123"
 * }
 * 
 * Response:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */
app.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    // Check credentials
    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /balance
 * Get account balance (protected route)
 * 
 * Headers:
 * Authorization: Bearer <JWT_TOKEN>
 * 
 * Response:
 * {
 *   "username": "john_doe",
 *   "balance": 5000
 * }
 */
app.get('/balance', authMiddleware, (req, res) => {
  try {
    const username = req.user.username;
    const user = userDatabase[username];

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.status(200).json({
      username,
      balance: user.balance
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * POST /deposit
 * Deposit money to account (protected route)
 * 
 * Headers:
 * Authorization: Bearer <JWT_TOKEN>
 * 
 * Request Body:
 * {
 *   "amount": 1000
 * }
 * 
 * Response:
 * {
 *   "username": "john_doe",
 *   "balance": 6000,
 *   "message": "Deposited $1000"
 * }
 */
app.post('/deposit', authMiddleware, (req, res) => {
  try {
    const { amount } = req.body;
    const username = req.user.username;
    const user = userDatabase[username];

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Validate amount
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        error: 'Amount is required'
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return res.status(400).json({
        error: 'Amount must be a valid number'
      });
    }

    if (numAmount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    // Process deposit
    user.balance += numAmount;

    res.status(200).json({
      username,
      balance: user.balance,
      message: `Deposited $${numAmount}`
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * POST /withdraw
 * Withdraw money from account (protected route)
 * 
 * Headers:
 * Authorization: Bearer <JWT_TOKEN>
 * 
 * Request Body:
 * {
 *   "amount": 500
 * }
 * 
 * Response:
 * {
 *   "username": "john_doe",
 *   "balance": 4500,
 *   "message": "Withdrew $500"
 * }
 */
app.post('/withdraw', authMiddleware, (req, res) => {
  try {
    const { amount } = req.body;
    const username = req.user.username;
    const user = userDatabase[username];

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Validate amount
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        error: 'Amount is required'
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return res.status(400).json({
        error: 'Amount must be a valid number'
      });
    }

    if (numAmount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    // Check balance
    if (user.balance < numAmount) {
      return res.status(400).json({
        error: 'Insufficient balance',
        currentBalance: user.balance
      });
    }

    // Process withdrawal
    user.balance -= numAmount;

    res.status(200).json({
      username,
      balance: user.balance,
      message: `Withdrew $${numAmount}`
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 JWT Banking API Server Running!`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`🔐 JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);
    console.log(`⏰ Token Expiry: ${JWT_EXPIRES_IN}`);
    console.log(`========================================\n`);
    console.log('📝 Test Credentials:');
    console.log(`   Username: ${VALID_USERNAME}`);
    console.log(`   Password: ${VALID_PASSWORD}`);
    console.log(`   Initial Balance: $${userDatabase[VALID_USERNAME].balance}\n`);
  });
}

module.exports = app;
