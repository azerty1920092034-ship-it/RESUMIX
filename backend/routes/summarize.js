const router = require("express").Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const Summary = require("../models/Summary");

const FREE_LIMIT = 6;

router.post("/summarize", authMiddleware, async (req, res) => {
  try {
    const Groq = require("groq-sdk");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { text, language, summaryRate = 40 } = req.body;

    if (!text || text.split(" ").length < 10) {
      return res.json({ summary: "Texte trop court (minimum 10 mots)" });
    }

    const user = req.user;
    const today = new Date().toDateString();
    const isTrial = Date.now() < new Date(user.trialEnds).getTime();
    const isPro = user.isPro && user.proEnds && new Date(user.proEnds) > new Date();

    if (user.lastReset !== today) {
      user.dailyCount = 0;
      user.lastReset = today;
      await user.save();
    }

    if (!isTrial && !isPro && user.dailyCount >= FREE_LIMIT) {
      return res.status(403).json({ error: "Limite atteinte", limitReached: true });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Tu es un expert en resume de texte. Reponds en ${language}. 
          Tu dois produire un resume qui fait environ ${summaryRate}% de la longueur du texte original.
          Si le taux est 20%, le resume doit etre tres court et ne garder que l essentiel.
          Si le taux est 40%, le resume doit etre moderement court.
          Si le taux est 60%, le resume doit conserver la plupart des informations importantes.
          Si le taux est 80%, le resume doit etre presque complet avec peu de reduction.
          Respecte strictement ce taux de compression.`
        },
        {
          role: "user",
          content: `Resume ce texte en environ ${summaryRate}% de sa longueur originale : ${text}`
        }
      ]
    });

    const summaryText = response.choices[0].message.content;

    const wordCountOriginal = text.trim().split(/\s+/).length;
    const wordCountSummary = summaryText.trim().split(/\s+/).length;
    const reductionPercent = Math.round((1 - wordCountSummary / wordCountOriginal) * 100);

    await Summary.create({
      user: user._id,
      originalText: text,
      summary: summaryText,
      language,
      wordCountOriginal,
      wordCountSummary,
      reductionPercent
    });

    if (!isTrial && !isPro) {
      user.dailyCount += 1;
      await user.save();
    }

    res.json({ summary: summaryText });

  } catch (error) {
    console.error(error);
    res.status(500).json({ summary: "Erreur serveur : " + error.message });
  }
});

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const summaries = await Summary.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ summaries });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/schema", authMiddleware, async (req, res) => {
  try {
    const Groq = require("groq-sdk");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { summary } = req.body;
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Tu es un expert en creation de schemas conceptuels. Cree un schema hierarchique simple avec des fleches (->) et des tirets pour representer les idees principales et leurs relations. Utilise uniquement du texte ASCII." },
        { role: "user", content: "Cree un schema conceptuel de ce resume : " + summary }
      ]
    });
    res.json({ schema: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/qcm", authMiddleware, async (req, res) => {
  try {
    const Groq = require("groq-sdk");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { summary } = req.body;
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Tu es un expert en creation de QCM. Genere exactement 10 questions a choix multiples basees sur le resume fourni.
          Reponds UNIQUEMENT en JSON valide avec ce format exact:
          {
            "questions": [
              {
                "question": "La question ici",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct": 0
              }
            ]
          }
          Le champ "correct" est l index (0, 1, 2 ou 3) de la bonne reponse dans le tableau "options".
          Ne mets rien d autre que le JSON.`
        },
        { role: "user", content: "Cree un QCM de 10 questions sur ce resume : " + summary }
      ]
    });
    const content = response.choices[0].message.content;
    const clean = content.replace(/```json|```/g, "").trim();
    const qcm = JSON.parse(clean);
    res.json(qcm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la generation du QCM" });
  }
});

module.exports = router;