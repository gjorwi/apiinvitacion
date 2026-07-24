const mongoose = require("mongoose");

const galleryImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  label: { type: String, default: "" },
  colSpan: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  invitationCode: { type: String, default: "" },
  guestName: { type: String, default: "" },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GalleryImage", galleryImageSchema);
