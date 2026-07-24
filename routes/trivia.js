const express = require("express");
const router = express.Router();
const TriviaScore = require("../models/TriviaScore");
const Rsvp = require("../models/Rsvp");

router.post("/save", async (req, res) => {
  try {
    const { invitationCode, score, total } = req.body;
    if (!invitationCode || score === undefined)
      return res.status(400).json({ error: "Faltan datos requeridos" });

    const rsvp = await Rsvp.findOne({ invitationCode });
    if (!rsvp) return res.status(404).json({ error: "Código de invitación inválido" });

    const existing = await TriviaScore.findOne({ invitationCode });
    if (existing) return res.status(409).json({ error: "Este código ya registró un puntaje" });

    const trivia = new TriviaScore({ name: rsvp.name, invitationCode, score, total });
    await trivia.save();
    res.status(201).json({ message: "Puntaje guardado", trivia });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/scores", async (req, res) => {
  try {
    const scores = await TriviaScore.find().sort({ score: -1, createdAt: 1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/check/:code", async (req, res) => {
  try {
    const existing = await TriviaScore.findOne({ invitationCode: req.params.code });
    res.json({ used: !!existing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
