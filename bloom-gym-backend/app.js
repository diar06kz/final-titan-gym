const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./src/config/db");
const { env, assertRequired } = require("./src/config/env");
assertRequired();
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");

const { notFound, errorHandler } = require("./src/middlewares/errorMiddleware");

const app = express();


app.use(helmet());

const allowedOrigins = env.CLIENT_URL.split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS_NOT_ALLOWED"));

    },
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ message: "API is running" })); 

app.use("/", authRoutes);        // POST /register, POST /login
app.use("/users", userRoutes);   // GET/PUT /users/profile
app.use("/bookings", bookingRoutes); // CRUD /bookings

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(env.PORT, () => console.log(`Server running at http://localhost:${env.PORT}`));
  })
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });
