# JWT Banking API Authentication Demo

> A complete, production-ready JWT authentication implementation for a secure banking API built with Express.js

## 🎯 Overview

This project demonstrates how to implement secure authentication in an Express.js application using JSON Web Tokens (JWT). It includes:

- **JWT Authentication**: Secure token-based authentication
- **Login Endpoint**: `/login` - Accepts credentials and returns a signed JWT token
- **Protected Routes**: Banking operations that require JWT verification
- **Middleware**: JWT verification middleware for protecting routes
- **Error Handling**: Comprehensive error handling for common scenarios
- **Testing Documentation**: Complete examples using curl and Postman

## 🏗️ Project Structure

```
jwt-banking-api-auth-demo/
├── server.js              # Main Express application
├── middleware/
│   └── authMiddleware.js  # JWT verification middleware
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🚀 Features

### API Endpoints

#### 1. **POST /login**
Login endpoint that returns a JWT token
- **Request Body**: `{ "username": "user", "password": "password123" }`
- **Response**: `{ "token": "eyJhbGci..." }`
- **Authentication**: None required
- **Error Cases**:
  - Missing username or password (400)
  - Invalid credentials (401)

#### 2. **GET /balance** (Protected)
View account balance
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "username": "user", "balance": 5000 }`
- **Error Cases**:
  - Missing or invalid token (401)
  - Malformed Authorization header (401)

#### 3. **POST /deposit** (Protected)
Deposit money to account
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ "amount": 1000 }`
- **Response**: `{ "username": "user", "balance": 6000, "message": "Deposited $1000" }`
- **Error Cases**:
  - Missing or invalid token (401)
  - Invalid amount format (400)
  - Negative or zero amount (400)

#### 4. **POST /withdraw** (Protected)
Withdraw money from account
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ "amount": 500 }`
- **Response**: `{ "username": "user", "balance": 4500, "message": "Withdrew $500" }`
- **Error Cases**:
  - Missing or invalid token (401)
  - Invalid amount format (400)
  - Insufficient balance (400)
  - Negative or zero amount (400)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Postman (optional, for testing)
- curl (for command-line testing)

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jwt-banking-api-auth-demo.git
   cd jwt-banking-api-auth-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file and set your JWT secret:
   ```
   PORT=3000
   JWT_SECRET=your-super-secret-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   ```

5. **Start the server**
   ```bash
   npm start
   ```
   
   The API will be running at `http://localhost:3000`

## 🧪 Testing

### Test Case 1: Successful Login

**cURL:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{ "username": "john_doe", "password": "password123" }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5fZG9lIiwiaWF0IjoxNjM2NDUyODAwLCJleHAiOjE2MzY1MzkyMDB9.kR5mBh3K8vL7mP9qN2xW"
}
```

### Test Case 2: Invalid Login Credentials

**cURL:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{ "username": "john_doe", "password": "wrongpassword" }'
```

**Response:**
```json
{
  "error": "Invalid credentials"
}
```

### Test Case 3: Access Protected Route with Valid Token

**Get token first:**
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{ "username": "john_doe", "password": "password123" }' | jq -r '.token')
```

**Check balance:**
```bash
curl -X GET http://localhost:3000/balance \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "username": "john_doe",
  "balance": 5000
}
```

### Test Case 4: Access Protected Route without Token

**cURL:**
```bash
curl -X GET http://localhost:3000/balance
```

**Response:**
```json
{
  "error": "No token provided"
}
```

### Test Case 5: Access Protected Route with Invalid Token

**cURL:**
```bash
curl -X GET http://localhost:3000/balance \
  -H "Authorization: Bearer invalid-token-here"
```

**Response:**
```json
{
  "error": "Invalid token"
}
```

### Test Case 6: Successful Deposit

**cURL:**
```bash
curl -X POST http://localhost:3000/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "amount": 1000 }'
```

**Response:**
```json
{
  "username": "john_doe",
  "balance": 6000,
  "message": "Deposited $1000"
}
```

### Test Case 7: Successful Withdrawal

**cURL:**
```bash
curl -X POST http://localhost:3000/withdraw \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "amount": 500 }'
```

**Response:**
```json
{
  "username": "john_doe",
  "balance": 5500,
  "message": "Withdrew $500"
}
```

### Test Case 8: Insufficient Balance for Withdrawal

**cURL:**
```bash
curl -X POST http://localhost:3000/withdraw \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "amount": 50000 }'
```

**Response:**
```json
{
  "error": "Insufficient balance",
  "currentBalance": 5500
}
```

### Test Case 9: Invalid Amount in Deposit

**cURL:**
```bash
curl -X POST http://localhost:3000/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "amount": -500 }'
```

**Response:**
```json
{
  "error": "Amount must be greater than 0"
}
```

## 📮 Testing with Postman

### Step 1: Create a new request for login
1. Open Postman
2. Create a new POST request to `http://localhost:3000/login`
3. Set Body as JSON:
   ```json
   {
     "username": "john_doe",
     "password": "password123"
   }
   ```
4. Click Send
5. Copy the token from the response

### Step 2: Set up environment variable
1. Click on "Environment" tab
2. Create a new environment or select existing
3. Add variable: `token` = (paste the copied token)
4. Save

### Step 3: Create requests with Authorization header
For each protected route (balance, deposit, withdraw):
1. Create new request
2. Go to "Authorization" tab
3. Select "Bearer Token" type
4. Paste token or use `{{token}}` variable
5. Send request

## 🔐 Security Features

1. **JWT Signing**: Tokens are signed with a secret key
2. **Token Expiration**: Configurable token expiration time (default: 24 hours)
3. **Bearer Token**: Uses industry-standard Bearer token scheme
4. **Error Messages**: Secure error messages that don't leak sensitive information
5. **Input Validation**: Validates all incoming requests
6. **CORS Ready**: Can be configured for cross-origin requests

## 🛠️ Middleware Implementation

The `authMiddleware.js` handles JWT verification:
- Extracts token from Authorization header
- Verifies token signature and expiration
- Attaches user information to request object
- Returns appropriate error messages for invalid tokens

## 📝 Hardcoded Credentials (For Demo Purposes)

- **Username**: `john_doe`
- **Password**: `password123`
- **Initial Balance**: `$5000`

**⚠️ Important**: In production, never hardcode credentials. Use a proper database and password hashing (bcrypt).

## 🚨 Error Handling

| Error | Status Code | Description |
|-------|-------------|-------------|
| No token provided | 401 | Authorization header missing |
| Invalid token format | 401 | Malformed Bearer token |
| Invalid token | 401 | Token signature verification failed |
| Token expired | 401 | JWT token has expired |
| Invalid credentials | 401 | Username or password is incorrect |
| Missing fields | 400 | Required fields are missing |
| Invalid amount | 400 | Amount is not a valid number |
| Negative amount | 400 | Amount must be positive |
| Insufficient balance | 400 | Not enough funds for withdrawal |

## 🌐 Environment Variables

Create a `.env` file with the following:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# API Configuration
API_VERSION=v1
```

## 📚 Dependencies

- **express**: Web framework
- **dotenv**: Environment variable management
- **jsonwebtoken**: JWT creation and verification
- **cors**: Cross-Origin Resource Sharing
- **body-parser**: Request body parsing

## 🎓 Learning Objectives Covered

✅ Understanding JWT structure and claims
✅ Generating and signing tokens
✅ Implementing JWT verification middleware
✅ Protecting API routes with authentication
✅ Error handling and validation
✅ Testing secured endpoints
✅ Security best practices
✅ Token expiration and refresh strategies

## 📖 Additional Resources

- [JWT.io - JWT Introduction](https://jwt.io/introduction)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js jsonwebtoken Package](https://www.npmjs.com/package/jsonwebtoken)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## 🤝 Contributing

Feel free to fork this project and submit pull requests with improvements or additional features.

## 📄 License

MIT License - feel free to use this for educational and commercial purposes.

## 👤 Author

Created for learning JWT authentication implementation.

## 🎉 Quick Start Summary

```bash
# 1. Clone and install
git clone <repo-url>
cd jwt-banking-api-auth-demo
npm install

# 2. Setup environment
cp .env.example .env

# 3. Start server
npm start

# 4. Login to get token
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "password123"}'

# 5. Use token to access protected routes
curl -X GET http://localhost:3000/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**Happy Learning! 🚀**
