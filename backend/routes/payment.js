const router = require("express").Router();
const { FedaPay, Transaction } = require("fedapay");
const User = require("../models/User");

FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
FedaPay.setEnvironment("live");

// Créer une transaction FedaPay
router.post("/pay", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Veuillez vous connecter" });
    }

    const user = req.user;

    const transaction = await Transaction.create({
      description: "Abonnement RESUMIX PRO - 1 mois",
      amount: 3000,
      currency: { iso: "XOF" },
      callback_url: "http://localhost:5000/payment/callback",
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

    res.redirect("http://localhost:3000?payment=" + status);

  } catch (error) {
    console.error(error);
    res.redirect("http://localhost:3000?payment=error");
  }
});

module.exports = router;