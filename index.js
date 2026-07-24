const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const rsvpRoutes = require("./routes/rsvp");
const galleryRoutes = require("./routes/gallery");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static("uploads"));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/rsvp", rsvpRoutes);
app.use("/api/gallery", galleryRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "API de invitación - Susana's Spa Celebration" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
