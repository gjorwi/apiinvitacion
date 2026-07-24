const mongoose = require("mongoose");

const triviaScoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  invitationCode: { type: String, required: true, unique: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TriviaScore", triviaScoreSchema);
