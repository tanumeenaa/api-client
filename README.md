#  API Client: A Simplified Postman with Smart Error Explanations

A full-stack API testing tool designed to make API development accessible to beginners. Unlike standard tools like Postman, this application features a custom **Explanation Engine** that translates complex HTTP status codes and network errors into plain-English, actionable checklists.

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)

## 🌐 Live Demo
🔗 **[Click here to try the live app!](https://api-client-mauve.vercel.app/)**

---

## 📖 About The Project
When beginners start working with APIs, a `404 Not Found` or `500 Internal Server Error` can be confusing. I built this project to solve that problem. 

It acts as a secure proxy to test external APIs, but its standout feature is the **Explanation Engine**. When a request fails, the backend analyzes the error and returns a human-readable explanation along with a checklist of things the user can check to fix it.

## ✨ Key Features
- 🧠 **Smart Explanation Engine:** Translates HTTP errors (400, 401, 403, 404, 500) into plain English with troubleshooting checklists.
- 🛡️ **Secure Proxy Server:** A custom Node/Express proxy that safely handles external requests, bypassing CORS issues and preventing SSRF attacks.
- 🔐 **Secure Authentication:** JWT-based login/signup flow with password hashing using Bcrypt.
- 💾 **Request History:** Save your favorite API calls to MongoDB and reload them with a single click.
- 🎨 **Modern UI:** Clean, responsive, dark-themed interface built with React and Tailwind CSS.

## 🛠️ Tech Stack
| Category | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose) |
| **Authentication** | JWT, Bcrypt |
| **Deployment** | Vercel (Frontend), Render (Backend) |

## 🏗️ Architecture & How It Works
1. **The Proxy:** The frontend sends requests to the Node.js backend (`/api/send`). The backend uses `axios` to fetch the data from the target URL. This prevents CORS errors in the browser.
2. **The Explanation Engine:** If the target API returns an error, the backend intercepts the status code, maps it to a predefined explanation object, and sends it back to the UI alongside the raw error.
3. **Security:** All sensitive routes (like saving requests) are protected by a JWT middleware. The backend also includes a URL guard to prevent Server-Side Request Forgery (SSRF) attacks.

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Authenticate user and return JWT |

### API Proxy & Requests
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Check server status |
| `POST` | `/api/send` | Send a proxied request to an external API |
| `GET` | `/api/requests` | Get all saved requests for the logged-in user (Protected) |
| `POST` | `/api/requests` | Save a new API request to the database (Protected) |

| Login Screen | Main Dashboard | Error Explanation |
| :---: | :---: | :---: |
| *[Login Image]* | *[Dashboard Image]* | *[Error Image]* |

## 📦 Local Setup & Installation

### Prerequisites
- Node.js installed
- A free MongoDB Atlas account

### 1. Clone the repository
```bash
git clone https://github.com/tanumeenaa/api-client.git
cd api-client
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
ALLOW_PRIVATE=true
```
Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd client
npm install
npm run dev
```

## 🚀 Future Enhancements
- [ ] Add support for GraphQL requests.
- [ ] Implement "Collections" to group saved requests by project.
- [ ] Add an AI-powered feature to auto-generate request bodies based on the endpoint URL.

## 👤 Author
**Tanu Meena**
- GitHub: [@tanumeenaa](https://github.com/tanumeenaa)
- LinkedIn: [https://www.linkedin.com/in/tanu-meena-512743289/]

---
*Built with ❤️ to make API development easier for everyone.*
```