# Setup

## Prerequisites

- **Node.js** 20.x (or any Node 18+ release)
- **npm** 10.x (bundled with Node)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) — either installed as a local service, or a connection string to MongoDB Atlas

## 1. Clone / Open the Project

```bash
cd announcement
```

## 2. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

## 3. Environment Variables

Copy the example env file and adjust values if needed:

```bash
cp .env.example server/.env
```

`server/.env` variables:

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/task_management` |
| `JWT_SECRET` | Secret used to sign JWTs — use a long random string | `a_long_random_string` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `PORT` | Backend server port | `5000` |
| `CLIENT_URL` | Frontend origin, used for CORS | `http://localhost:5173` |

The client reads `VITE_API_URL` (optional, defaults to `http://localhost:5000/api`) if you need to point it at a different backend.

## 4. Start MongoDB

Ensure MongoDB is running locally, e.g.:

```bash
# Windows (if installed as a service)
net start MongoDB

# macOS/Linux
mongod --dbpath /path/to/data
```

## 5. Seed the Database

From the `server` directory:

```bash
npm run seed
```

This creates 1 Admin, 2 Staff, and 5 User accounts. See the root [README.md](../README.md) for the development credentials.

## 6. Run the Backend

```bash
cd server
npm run dev
```

The API starts on `http://localhost:5000`. Verify it's running:

```bash
curl http://localhost:5000/api/health
```

## 7. Run the Frontend

```bash
cd client
npm run dev
```

The app starts on `http://localhost:5173`. Open it in a browser and log in with any of the seeded accounts.

## Production Build

```bash
# Backend
cd server && npm run build && npm start

# Frontend
cd client && npm run build && npm run preview
```
