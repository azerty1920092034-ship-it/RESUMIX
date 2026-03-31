const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const passport = require("passport");
const User = require("../models/User");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "https://resumix-1f.onrender.com/login" }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`https://resumix-1f.onrender.com?token=${token}`);
  }
);

// Inscription email
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email deja utilise" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashed,
      firstVisit: new Date(),
      trialEnds: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    const token = generateToken(user);
    res.json({ token, user: { name: user.name, email: user.email, isPro: user.isPro, avatar: user.avatar, trialEnds: user.trialEnds, dailyCount: user.dailyCount } });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Connexion email
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    const token = generateToken(user);
    res.json({ token, user: { name: user.name, email: user.email, isPro: user.isPro, avatar: user.avatar, trialEnds: user.trialEnds, dailyCount: user.dailyCount } });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Mot de passe oublié
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Aucun compte avec cet email" });
    if (user.googleId && !user.password) {
      return res.status(400).json({ error: "Ce compte utilise la connexion Google" });
    }
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetCode = resetCode;
    user.resetExpires = resetExpires;
    await user.save();
    await transporter.sendMail({
      from: `"RESUMIX" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Code de reinitialisation RESUMIX",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #5b45ff;">RESUMIX</h2>
          <p>Voici votre code de reinitialisation :</p>
          <div style="background: #f5f4ff; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 2.5rem; font-weight: 800; color: #5b45ff; letter-spacing: 8px;">${resetCode}</span>
          </div>
          <p style="color: #666;">Ce code expire dans <strong>15 minutes</strong>.</p>
        </div>
      `
    });
    res.json({ success: true, message: "Code envoye par email" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l envoi de l email" });
  }
});

// Réinitialiser mot de passe
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    if (!user.resetCode || user.resetCode !== code) return res.status(400).json({ error: "Code incorrect" });
    if (new Date() > user.resetExpires) return res.status(400).json({ error: "Code expire." });
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetExpires = undefined;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Vérifier session
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.json({ user: null });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.json({ user: null });
    const isTrial = Date.now() < new Date(user.trialEnds).getTime();
    const isPro = user.isPro && user.proEnds && new Date(user.proEnds) > new Date();
    res.json({
      user: {
        name: user.name, email: user.email, avatar: user.avatar,
        isPro, isTrial, trialEnds: user.trialEnds,
        dailyCount: user.dailyCount, lastReset: user.lastReset,
      }
    });
  } catch {
    res.json({ user: null });
  }
});

// Déconnexion
router.get("/logout", (req, res) => {
  res.json({ success: true });
});

module.exports = router;