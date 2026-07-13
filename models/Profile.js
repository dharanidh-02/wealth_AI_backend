const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: String,
  monthlyIncome: Number,
  monthlyExpenses: Number,
  totalExpenses: Number,
  investmentTimeline: String,
  loans: String,
  financialGoals: String,
  riskTolerance: String

}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);