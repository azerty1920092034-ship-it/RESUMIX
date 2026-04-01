const router = require("express").Router();
const { FedaPay, Transaction } = require("fedapay");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
FedaPay.setEnvironment("live");

// Créer une transaction FedaPay
router.post("/pay", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    const transaction = await Transaction.create({
      description: "Abonnement RESUMIX PRO - 1 mois",
      amount: 3000,
      currency: { iso: "XOF" },
      callback_url: "https://resumix-1-pmv0.onrender.com/payment/callback",
      customer: {
        firstname: user.name.split(" ")[0] || user.name,
        lastname: user.name.split(" ")[1] || "",
        email: user.email,
      }
    });

    const token = await transaction.generateToken();
    res.json({ url: token.url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur paiement : " + error.message });
  }
});

// Callback après paiement
router.get("/callback", async (req, res) => {
  try {
    const { id, status } = req.query;

    if (status === "approved") {
      const transaction = await Transaction.retrieve(id);

      if (transaction.status === "approved") {
        const email = transaction.customer.email;
        const user = await User.findOne({ email });

        if (user) {
          user.isPro = true;
          user.proEnds = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await user.save();
        }
      }
    }

    res.redirect("https://resumix-1f.onrender.com?payment=" + status);

  } catch (error) {
    console.error(error);
    res.redirect("https://resumix-1f.onrender.com?payment=error");
  }
});

module.exports = router;