# SnapOCR Backend

This is the backend for the SnapOCR OCR application. It provides API endpoints for user authentication, document upload, and OCR processing.

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- Multer for file uploads
- Mistral AI for OCR processing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Mistral AI API key

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/SnapOCR
JWT_SECRET=your_jwt_secret_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
NODE_ENV=development
```

5. Start the server:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Documents

- `POST /api/documents/upload` - Upload a document (protected)
- `GET /api/documents` - Get all documents for a user (protected)
- `GET /api/documents/:id` - Get a document by ID (protected)
- `PUT /api/documents/:id/status` - Update document status (protected)
- `DELETE /api/documents/:id` - Delete a document (protected)
- `GET /api/documents/:id/job` - Get processing job status (protected)

## Project Structure

```
/backend
├── config/                  # Configuration files
│   ├── database.js          # MongoDB connection setup
│   └── multer.js            # File upload configuration
├── controllers/             # Route controllers
│   ├── authController.js
│   └── documentController.js
├── middleware/              # Express middleware
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Error handling middleware
│   └── validation.js        # Input validation middleware
├── models/                  # MongoDB models
│   ├── User.js
│   ├── Document.js
│   └── ProcessingJob.js
├── routes/                  # API routes
│   ├── authRoutes.js
│   └── documentRoutes.js
├── services/                # Business logic
│   └── ocrService.js        # Mistral OCR integration
├── utils/                   # Utility functions
│   ├── generateToken.js
│   └── validators.js
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── README.md
└── server.js                # Server entry point
```

## Error Handling

The API uses a centralized error handling mechanism. All errors are caught by the error handling middleware and returned to the client with appropriate status codes and messages.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## File Upload

The API uses Multer for handling file uploads. Files are stored in the `uploads` directory, organized by user ID.

## OCR Processing

The API uses the Mistral AI API for OCR processing. When a document is uploaded, a processing job is created and the OCR processing is started in the background. The client can check the status of the processing job using the `/api/documents/:id/job` endpoint. 