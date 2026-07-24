const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const GalleryImage = require("../models/GalleryImage");
const Rsvp = require("../models/Rsvp");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Solo se permiten imágenes"));
  },
});

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.approved === "true") filter.approved = true;
    const images = await GalleryImage.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(images);
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

    const count = await GalleryImage.countDocuments({ invitationCode });
    const remaining = Math.max(0, 4 - count);
    res.json({ valid: true, name: rsvp.name, invitationCode: rsvp.invitationCode, uploaded: count, remaining });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { label, guestName, invitationCode } = req.body;

    if (!guestName || !invitationCode)
      return res.status(400).json({ error: "Nombre y código requeridos" });

    const rsvp = await Rsvp.findOne({ invitationCode });
    if (!rsvp) return res.status(404).json({ error: "Código inválido" });
    if (rsvp.name.toLowerCase() !== guestName.trim().toLowerCase())
      return res.status(400).json({ error: "El nombre no coincide con el código" });

    const count = await GalleryImage.countDocuments({ invitationCode });
    if (count >= 4) return res.status(400).json({ error: "Límite de 4 fotos por invitada" });

    const ext = ".jpg";
    const filename = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    const outputPath = path.join("uploads", filename);

    await sharp(req.file.buffer)
      .resize(1200, undefined, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(outputPath);

    const url = `http://localhost:4000/uploads/${filename}`;
    const image = new GalleryImage({
      url,
      label: label || "Subida por invitados",
      invitationCode,
      guestName: guestName.trim(),
      approved: false,
    });
    await image.save();
    res.status(201).json({ message: "Imagen subida. Pendiente de aprobación.", image, remaining: 4 - (count + 1) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/approve/:id", async (req, res) => {
  try {
    const { approved } = req.body;
    const image = await GalleryImage.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true }
    );
    if (!image) return res.status(404).json({ error: "Imagen no encontrada" });
    res.json({ message: `Imagen ${approved ? "aprobada" : "rechazada"}`, image });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { label, colSpan, order } = req.body;
    const image = await GalleryImage.findByIdAndUpdate(
      req.params.id,
      { label, colSpan, order },
      { new: true }
    );
    if (!image) return res.status(404).json({ error: "Imagen no encontrada" });
    res.json({ message: "Imagen actualizada", image });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await GalleryImage.findByIdAndDelete(req.params.id);
    res.json({ message: "Imagen eliminada" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/", async (_req, res) => {
  try {
    await GalleryImage.deleteMany({});
    res.json({ message: "Todas las imágenes eliminadas" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
