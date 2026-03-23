require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");

const app = express();

const corsOptions = {
  origin: function(origin, callback) {
    const allowed = ["http://localhost:3000", "http://localhost:3001", "https://resumix-1.onrender.com"];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecte"))
  .catch(err => console.error("Erreur MongoDB:", err.message));

require("./passport")(passport);

const authRoutes = require("./routes/auth");
const summarizeRoutes = require("./routes/summarize");
const paymentRoutes = require("./routes/payment");
const libraryRoutes = require("./routes/library");
const uploadRoutes = require("./routes/upload");

app.use("/auth", authRoutes);
app.use("/api", summarizeRoutes);
app.use("/payment", paymentRoutes);
app.use("/library", libraryRoutes);
app.use("/upload", uploadRoutes);

app.listen(5000, "0.0.0.0", () => {
  console.log("Serveur RESUMIX actif sur le port 5000");
});