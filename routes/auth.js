const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// FIXED: Pull both admin utilities and db from your centralized config file
const { admin, db } = require("../config/firebase");

/* REGISTER */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const usersRef = db.collection("users");

    const snapshot = await usersRef.where("email", "==", email).limit(1).get();

    if (!snapshot.empty) {
      return res.status(400).json({
        msg: "User already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserRef = await usersRef.add({
      name,
      email,
      password: hashedPassword,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // FIXED: Uses tracking timestamp correctly now
      profileCompleted: false
    });

    const payload = {
      user: {
        id: newUserRef.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: newUserRef.id,
            name,
            email
          }
        });
      }
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Server error"
    });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const usersRef = db.collection("users");

    const snapshot = await usersRef.where("email", "==", email).limit(1).get();

    if (snapshot.empty) {
      return res.status(400).json({
        msg: "Invalid credentials"
      });
    }

    const userDoc = snapshot.docs[0]; // FIXED: Mapped properly to pull element from doc array list
    const user = userDoc.data();
    const userId = userDoc.id;

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid credentials"
      });
    }

    const payload = {
      user: {
        id: userId
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "default_jwt_secret",
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;

        res.json({
          token,
          user: {
            id: userId,
            name: user.name,
            email: user.email,
            age: user.age,
            phone: user.phone,
            occupation: user.occupation,
            employmentType: user.employmentType,
            city: user.city,
            dependents: user.dependents,
            monthlyIncome: user.monthlyIncome,
            monthlyExpenses: user.monthlyExpenses,
            riskTolerance: user.riskTolerance,
            investmentTimeline: user.investmentTimeline,
            financialGoals: user.financialGoals,
            profileCompleted: user.profileCompleted || false
          }
        });
      }
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "Server error"
    });
  }
});

module.exports = router;
