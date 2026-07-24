const express = require("express");
const router = express.Router();
const Rsvp = require("../models/Rsvp");

async function generateCode() {
  for (let attempt = 0; attempt < 50; attempt++) {
    const code = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    const exists = await Rsvp.findOne({ invitationCode: code });
    if (!exists) return code;
  }
  throw new Error("No se pudo generar un código único");
}

router.post("/", async (req, res) => {
  try {
    const code = await generateCode();
    const rsvp = new Rsvp({ ...req.body, invitationCode: code });
    await rsvp.save();
    res.status(201).json({ message: "Confirmación guardada", invitationCode: code, rsvp });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const rsvps = await Rsvp.find().sort({ createdAt: -1 });
    res.json(rsvps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { name, invitationCode } = req.body;
    const rsvp = await Rsvp.findOne({ invitationCode });
    if (!rsvp) return res.status(404).json({ valid: false, error: "Código inválido" });
    if (rsvp.name.toLowerCase() !== name.trim().toLowerCase())
      return res.status(400).json({ valid: false, error: "El nombre no coincide con el código" });
    res.json({ valid: true, name: rsvp.name, invitationCode: rsvp.invitationCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
