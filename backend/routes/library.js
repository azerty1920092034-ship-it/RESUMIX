const router = require("express").Router();
const BookUsage = require("../models/BookUsage");

const BOOK_QUESTION_LIMIT = 16;

// Vérifier la limite d'un livre
const checkAndUpdateLimit = async (userId, bookTitle) => {
  const today = new Date().toDateString();
  let usage = await BookUsage.findOne({ user: userId, bookTitle });

  if (!usage) {
    usage = await BookUsage.create({ user: userId, bookTitle, questionCount: 0, lastReset: today });
  }

  // Reset si nouveau jour
  if (usage.lastReset !== today) {
    usage.questionCount = 0;
    usage.lastReset = today;
    await usage.save();
  }

  return usage;
};

// Récupérer l'usage de tous les livres
router.get("/usage", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Veuillez vous connecter" });

    const today = new Date().toDateString();
    const usages = await BookUsage.find({ user: req.user._id });

    const result = {};
    for (const usage of usages) {
      if (usage.lastReset !== today) {
        result[usage.bookTitle] = 0;
      } else {
        result[usage.bookTitle] = usage.questionCount;
      }
    }

    res.json({ usage: result, limit: BOOK_QUESTION_LIMIT });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Répondre à une question sur un extrait de livre
router.post("/ask", async (req, res) => {
  try {
    const Groq = require("groq-sdk");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    if (!req.user) return res.status(401).json({ error: "Veuillez vous connecter" });

    const { text, question, subject, level, bookTitle } = req.body;

    // Vérifier la limite
    const usage = await checkAndUpdateLimit(req.user._id, bookTitle);
    if (usage.questionCount >= BOOK_QUESTION_LIMIT) {
      return res.status(403).json({
        error: `Limite atteinte pour ce livre (${BOOK_QUESTION_LIMIT} questions/jour)`,
        limitReached: true,
        bookTitle
      });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Tu es un professeur expert en ${subject} pour le niveau ${level}. 
          Reponds aux questions des eleves de maniere claire, pedagogique et adaptee a leur niveau.
          Base tes reponses sur le texte fourni et tes connaissances.`
        },
        {
          role: "user",
          content: `Texte de reference:\n${text}\n\nQuestion de l'eleve: ${question}`
        }
      ]
    });

    // Incrémenter le compteur
    usage.questionCount += 1;
    await usage.save();

    res.json({
      answer: response.choices[0].message.content,
      questionsLeft: BOOK_QUESTION_LIMIT - usage.questionCount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la reponse" });
  }
});

// Générer des exercices
router.post("/exercises", async (req, res) => {
  try {
    const Groq = require("groq-sdk");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    if (!req.user) return res.status(401).json({ error: "Veuillez vous connecter" });

    const { text, subject, level, bookTitle } = req.body;

    if (!text || text.split(" ").length < 20) {
      return res.status(400).json({ error: "Texte trop court (minimum 20 mots)" });
    }

    // Vérifier la limite
    const usage = await checkAndUpdateLimit(req.user._id, bookTitle);
    if (usage.questionCount >= BOOK_QUESTION_LIMIT) {
      return res.status(403).json({
        error: `Limite atteinte pour ce livre (${BOOK_QUESTION_LIMIT} questions/jour)`,
        limitReached: true,
        bookTitle
      });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Tu es un professeur expert en ${subject} pour le niveau ${level}. 
          Genere 5 exercices varies et progressifs bases sur le texte fourni.
          Reponds UNIQUEMENT en JSON valide avec ce format exact:
          {
            "exercises": [
              {
                "type": "qcm",
                "question": "La question ici",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct": 0,
                "explanation": "Explication de la reponse correcte"
              }
            ]
          }
          Pour vrai_faux: options = ["Vrai", "Faux"], correct = 0 ou 1
          Pour texte_libre: options = [], correct = -1, met la reponse dans explanation
          Ne mets rien d'autre que le JSON.`
        },
        { role: "user", content: `Genere des exercices sur ce texte de ${subject} niveau ${level}: ${text}` }
      ]
    });

    // Incrémenter le compteur (génération d'exercices = 1 question)
    usage.questionCount += 1;
    await usage.save();

    const content = response.choices[0].message.content;
    const clean = content.replace(/```json|```/g, "").trim();
    const exercises = JSON.parse(clean);

    res.json({
      ...exercises,
      questionsLeft: BOOK_QUESTION_LIMIT - usage.questionCount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la generation des exercices" });
  }
});

module.exports = router;