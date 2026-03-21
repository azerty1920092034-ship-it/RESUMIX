const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// Configurer nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3001/login" }),
  (req, res) => {
    res.redirect("http://localhost:3001");
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
    req.login(user, err => {
      if (err) return res.status(500).json({ error: "Erreur connexion" });
      res.json({ user: { name: user.name, email: user.email, isPro: user.isPro } });
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Connexion email
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    if (!user) return res.status(401).json({ error: info.message });
    req.login(user, err => {
      if (err) return res.status(500).json({ error: "Erreur connexion" });
      res.json({ user: { name: user.name, email: user.email, isPro: user.isPro } });
    });
  })(req, res, next);
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

    // Générer un code à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetCode = resetCode;
    user.resetExpires = resetExpires;
    await user.save();

    // Envoyer l'email
    await transporter.sendMail({
      from: `"RESUMIX" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Code de reinitialisation RESUMIX",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #5b45ff;">RESUMIX</h2>
          <p>Vous avez demande a reinitialiser votre mot de passe.</p>
          <p>Voici votre code de reinitialisation :</p>
          <div style="background: #f5f4ff; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 2.5rem; font-weight: 800; color: #5b45ff; letter-spacing: 8px;">${resetCode}</span>
          </div>
          <p style="color: #666;">Ce code expire dans <strong>15 minutes</strong>.</p>
          <p style="color: #666;">Si vous n'avez pas demande cette reinitialisation, ignorez cet email.</p>
        </div>
      `
    });

    res.json({ success: true, message: "Code envoye par email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
  }
});

// Vérifier le code et changer le mot de passe
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    if (!user.resetCode || user.resetCode !== code) {
      return res.status(400).json({ error: "Code incorrect" });
    }
    if (new Date() > user.resetExpires) {
      return res.status(400).json({ error: "Code expire. Demandez un nouveau code." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Mot de passe modifie avec succes" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Deconnexion
router.get("/logout", (req, res) => {
  req.logout(() => { res.json({ success: true }); });
});

// Verifier session
router.get("/me", (req, res) => {
  if (!req.user) return res.json({ user: null });
  const user = req.user;
  const isTrial = Date.now() < new Date(user.trialEnds).getTime();
  const isPro = user.isPro && user.proEnds && new Date(user.proEnds) > new Date();
  res.json({
    user: {
      name: user.name, email: user.email, avatar: user.avatar,
      isPro, isTrial, trialEnds: user.trialEnds,
      dailyCount: user.dailyCount, lastReset: user.lastReset,
    }
  });
});

module.exports = router;