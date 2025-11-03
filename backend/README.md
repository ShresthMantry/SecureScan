# Backend API - SecureScan

Node.js + Express.js backend API for the SecureScan Fraud Detection App.

## Features

- **User Authentication**: JWT-based registration and login
- **Community Posts**: CRUD operations for posts with likes and comments
- **ML Integration**: Proxy endpoints to Flask ML service for fraud detection
- **MongoDB**: Data persistence with Mongoose ORM

## Setup Instructions

### Prerequisites

- Node.js 16.x or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
   - Set a secure JWT_SECRET
   - Configure your MongoDB URI
   - Set the ML_SERVICE_URL to point to your Flask service

### Running the Service

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication Routes

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Post Routes

#### Get All Posts
```
GET /api/posts?page=1&limit=20
```

#### Get Single Post
```
GET /api/posts/:id
```

#### Create Post
```
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This site is a scam!",
  "image": "https://example.com/image.jpg"
}
```

#### Update Post
```
PUT /api/posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated content"
}
```

#### Delete Post
```
DELETE /api/posts/:id
Authorization: Bearer <token>
```

#### Like/Unlike Post
```
POST /api/posts/:id/like
Authorization: Bearer <token>
```

#### Add Comment
```
POST /api/posts/:id/comment
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Great find!"
}
```

#### Get User Posts
```
GET /api/posts/user/:userId
```

### Detection Routes (ML Proxy)

#### Detect Link
```
POST /api/detect/link
Content-Type: application/json

{
  "url": "https://example.com"
}
```

#### Detect QR Code
```
POST /api/detect/qr
Content-Type: multipart/form-data

image: [file]
```

#### Check ML Service Health
```
GET /api/detect/health
```

## Database Schema

### User Model
```javascript
{
  username: String (unique, 3-30 chars),
  email: String (unique, valid email),
  password: String (hashed, min 6 chars),
  createdAt: Date
}
```

### Post Model
```javascript
{
  userId: ObjectId (ref: User),
  content: String (1-1000 chars),
  image: String (optional),
  likes: [ObjectId] (ref: User),
  comments: [{
    userId: ObjectId (ref: User),
    text: String (1-500 chars),
    createdAt: Date
  }],
  createdAt: Date
}
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `ML_SERVICE_URL`: Flask ML service URL (default: http://localhost:5000)

## Development

- Uses `nodemon` for auto-reload in development
- Input validation with `express-validator`
- Password hashing with `bcryptjs`
- JWT authentication middleware
- CORS enabled for frontend integration

## Notes

- Ensure MongoDB is running before starting the server
- The Flask ML service must be running for detection endpoints to work
- JWT tokens expire after 7 days
- All dates are stored in UTC
