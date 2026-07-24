const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema({
  name: { type: String, required: true },
  colorPreference: { type: String, default: "" },
  foodRestrictions: { type: String, default: "" },
  invitationCode: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Rsvp", rsvpSchema);
