const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const GalleryImage = require("../models/GalleryImage");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Solo se permiten imágenes"));
  },
});

router.get("/", async (_req, res) => {
  try {
    const images = await GalleryImage.find().sort({ order: 1, createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { label, colSpan, order } = req.body;
    const url = `http://localhost:4000/uploads/${req.file.filename}`;
    const image = new GalleryImage({ url, label, colSpan: colSpan === "true", order: Number(order) || 0 });
    await image.save();
    res.status(201).json({ message: "Imagen subida", image });
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
