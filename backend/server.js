/* =========================
   IMPORTS & CONFIG
========================= */
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const session = require("express-session");
require("dotenv").config();

const User = require("./models/User");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());

app.use(cors({
  origin: "http://127.0.0.1:5500", // your frontend URL
  credentials: true
}));

app.use(session({
  secret: "startsmart-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

/* =========================
   EMAIL CONFIG (Mailtrap)
========================= */
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* =========================
   CONNECT MONGODB
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error:", err));

/* =========================
   REGISTER
========================= */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, field, role, experience } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      field,
      role,
      experience
    });

    await newUser.save();

    res.json({ message: "Registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   LOGIN (SESSION CREATED)
========================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    // ✅ Save user in session
    req.session.user = {
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({ message: "Login successful" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   GET CURRENT USER
========================= */
app.get("/user", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  res.json(req.session.user);
});

/* =========================
   LOGOUT
========================= */
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

/* =========================
   FORGOT PASSWORD (OTP)
========================= */
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: '"StartSmart AI" <no-reply@startsmart.com>',
      to: email,
      subject: "OTP for Reset Password",
      html: `<p>Your OTP is <b>${otp}</b>. Valid for 5 minutes.</p>`
    });

    res.json({ message: "OTP sent" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

/* =========================
   RESET PASSWORD
========================= */
app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ message: "Password updated" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   DASHBOARD
========================= */
app.get("/dashboard", (req, res) => {
  res.json({ message: "Welcome to Dashboard 🚀" });
});

/* =========================
   CHATBOT (SINGLE VERSION)
========================= */
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Type something" });
    }

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistral:latest",
        messages: [
          {
            role: "system",
            content: "You are a helpful startup assistant. Keep answers short and clear."
          },
          {
            role: "user",
            content: message
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error("Ollama API failed");
    }

    const data = await response.json();

    res.json({
      reply: data.message?.content || "No response"
    });

  } catch (error) {
    console.log("Chat error:", error.message);
    res.status(500).json({ reply: "Chat error" });
  }
});

/* =========================
   GET ALL USERS
========================= */
app.get("/users", async (req, res) => {
  const users = await User.find({}, { password: 0 });
  res.json(users);
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 