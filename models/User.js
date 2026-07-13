const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  /* AUTH DETAILS */

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    default: ""
  },

  googleId: {
    type: String,
    default: ""
  },

  /* PROFILE DETAILS */

  age: {
    type: String,
    default: ""
  },

  phone: {
    type: String,
    default: ""
  },

  occupation: {
    type: String,
    default: ""
  },

  employmentType: {
    type: String,
    default: ""
  },

  city: {
    type: String,
    default: ""
  },

  dependents: {
    type: String,
    default: ""
  },

  monthlyIncome: {
    type: String,
    default: ""
  },

  monthlyExpenses: {
    type: String,
    default: ""
  },

  riskTolerance: {
    type: String,
    default: ""
  },

  investmentTimeline: {
    type: String,
    default: ""
  },

  financialGoals: {
    type: String,
    default: ""
  },

  profileCompleted: {
    type: Boolean,
    default: false
  }

},
{
  timestamps: true
});

module.exports = mongoose.model(
  "User",
  userSchema
);