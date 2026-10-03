import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import sendRoute from "./sendRoute.js";
import authRoutes from "./routes/auth.js";
import requestsRoutes from './routes/requests.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use(sendRoute);

app.get("/", (req, res) => {
  res.json({ 
    message: "API Client Backend is running! 🚀",
    endpoints: {
     health: "/health",
     sendRequest: "/api/send",
     auth: "/auth/login or /auth/signup",
     savedRequests: "/api/requests"
       }
     });
   });

app.use('/auth', authRoutes);
   app.use('/api/requests', requestsRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});