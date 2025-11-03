/**
 * JWT Authentication Middleware
 * Verifies JWT tokens from the Authorization header
 * and attaches user information to the request object
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

/**
 * Authentication Middleware
 * 
 * This middleware:
 * 1. Extracts the JWT token from the Authorization header
 * 2. Verifies the token signature and expiration
 * 3. Attaches the decoded user information to req.user
 * 4. Passes control to the next middleware/route handler
 * 
 * Expected Authorization header format:
 * Authorization: Bearer <JWT_TOKEN>
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @returns {void}
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    // Check if authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Authorization header is missing'
      });
    }

    // Extract the token from the "Bearer <token>" format
    const parts = authHeader.split(' ');

    // Validate Bearer token format
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Invalid token format',
        message: 'Authorization header must be in format: Bearer <token>'
      });
    }

    const token = parts[1];

    // Verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Attach the decoded user information to the request object
      req.user = decoded;
      
      // Pass control to the next middleware/route handler
      next();
    } catch (verifyError) {
      // Handle token verification errors
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          message: 'Your session has expired. Please login again.',
          expiredAt: verifyError.expiredAt
        });
      }
      
      if (verifyError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'The provided token is invalid or malformed'
        });
      }
      
      // Generic token verification error
      return res.status(401).json({
        error: 'Token verification failed',
        message: verifyError.message
      });
    }
  } catch (error) {
    // Catch any unexpected errors
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during authentication'
    });
  }
};

/**
 * Export the middleware
 * Can be used in Express routes like:
 * app.get('/protected-route', authMiddleware, (req, res) => { ... })
 */
module.exports = authMiddleware;
