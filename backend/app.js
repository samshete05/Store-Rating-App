require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./src/routes/auth");
const usersRoutes = require("./src/routes/users");
const adminRoutes = require("./src/routes/admin");
const storeRoutes = require("./src/routes/stores");
const ratingRoutes = require("./src/routes/ratings");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "https://store-rating-app-teal.vercel.app,http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);

app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Server error",
  });
});

module.exports = app;
