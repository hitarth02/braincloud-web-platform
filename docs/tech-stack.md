# Tech Stack

## Frontend

| Technology | Version | Why it's used |
|---|---|---|
| **React** | 18 | Component-based UI library; industry standard for building interactive interfaces. |
| **TypeScript** | 5.5 | Adds static typing to catch bugs at compile time and makes the codebase self-documenting. |
| **Tailwind CSS** | 3.4 | Utility-first CSS framework that enables building a polished, consistent UI quickly without writing custom CSS files. |
| **React Router** | 6 | Declarative client-side routing, including nested routes and protected-route patterns. |
| **Axios** | 1.7 | Promise-based HTTP client with interceptor support, used to attach JWT tokens and handle 401 responses globally. |
| **Redux Toolkit** | 2.2 | Used only for authentication state (current user + token), since that is the one piece of state genuinely shared across the entire app. Avoids prop-drilling the logged-in user. |
| **React Hot Toast** | 2.4 | Lightweight toast notifications for success/error feedback. |
| **Lucide React** | — | Small, consistent icon set used throughout the UI. |
| **Recharts** | 2.12 | Simple charting library used for the task status breakdown chart on the Admin dashboard. |
| **Zod** | 3.23 | Schema validation for forms on the client, mirroring the backend's validation rules. |

## Backend

| Technology | Version | Why it's used |
|---|---|---|
| **Node.js** | 20 | JavaScript runtime for the server. |
| **Express.js** | 4.19 | Minimal, well-understood web framework for building the REST API. |
| **TypeScript** | 5.5 | Static typing across models, controllers, and middleware. |
| **MongoDB** | — | Document database that maps naturally to JSON-shaped resources like users and tasks. |
| **Mongoose** | 8.5 | ODM providing schema validation, middleware (e.g. password hashing hooks), and a typed query API for MongoDB. |
| **JWT (jsonwebtoken)** | 9 | Stateless authentication tokens used to protect API routes. |
| **bcryptjs** | 2.4 | Password hashing so plaintext passwords are never stored or compared directly. |
| **Zod** | 3.23 | Request validation middleware for all mutating endpoints. |
| **cors, cookie-parser, morgan** | — | Cross-origin support, cookie parsing, and HTTP request logging respectively. |

## Why Not More?

This project deliberately avoids Docker, Redis, microservices, message queues, and complex architectural patterns (see [architecture.md](./architecture.md)). The goal is a codebase that is simple to run locally with just Node.js and MongoDB, and simple to explain end-to-end in a viva.
