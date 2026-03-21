const router = require("express").Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// Stockage en mémoire
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format non supporte. Utilisez PDF, DOCX ou TXT."));
    }
  }
});

router.post("/extract", upload.single("file"), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Veuillez vous connecter" });
    if (!req.file) return res.status(400).json({ error: "Aucun fichier recu" });

    let text = "";
    const { mimetype, buffer, originalname } = req.file;

    if (mimetype === "application/pdf") {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (mimetype === "text/plain") {
      text = buffer.toString("utf-8");
    }

    if (!text.trim()) {
      return res.status(400).json({ error: "Impossible d'extraire le texte de ce fichier" });
    }

    res.json({
      text: text.trim(),
      filename: originalname,
      wordCount: text.trim().split(/\s+/).length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'extraction : " + error.message });
  }
});

module.exports = router;