const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

// FIXED: Pull both admin utilities and db from your centralized config file
const { admin, db } = require("../config/firebase");

/* GET USER PROFILE */
router.get("/", auth, async (req, res) => {
  try {
    const profilesRef = db.collection("profiles");
    const snapshot = await profilesRef.where("userId", "==", req.user.id).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    const profileDoc = snapshot.docs[0];
    res.json({ id: profileDoc.id, ...profileDoc.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* SAVE INITIAL USER PROFILE */
router.post("/", auth, async (req, res) => {
  try {
    const profilesRef = db.collection("profiles");
    const snapshot = await profilesRef.where("userId", "==", req.user.id).limit(1).get();

    if (!snapshot.empty) {
      return res.status(400).json({ msg: "Profile already exists" });
    }

    const profileData = {
      userId: req.user.id,
      assets: [], // Set default empty asset array wrapper to support UI table components
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const newProfileRef = await profilesRef.add(profileData);
    
    // Toggle profile completed tracking boolean indicator status flag on the parent user block
    await db.collection("users").doc(req.user.id).update({ profileCompleted: true });

    res.json({ msg: "Profile saved", profile: { id: newProfileRef.id, ...profileData } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ADD NEW ASSET RECORD ENTRY PIPELINE MATRIX */
router.post("/assets", auth, async (req, res) => {
  try {
    const { name, type, value, institution, isLeveragable } = req.body;

    if (!name || !type) {
      return res.status(400).json({ msg: "Name and Type properties are required" });
    }

    const profilesRef = db.collection("profiles");
    const snapshot = await profilesRef.where("userId", "==", req.user.id).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ msg: "Profile must be initialized first before adding assets" });
    }

    const profileDoc = snapshot.docs[0];
    const profileId = profileDoc.id;

    // Build the structural data dictionary mapped specifically to your Assets form fields
    const newAsset = {
      name,
      type,
      value: Number(value) || 0,
      institution: institution || "",
      isLeveragable: isLeveragable !== false, // Defaults to true if parameter is absent
      createdAt: new Date().toISOString()
    };

    // Use arrayUnion utility to atomically append a dictionary directly inside the array list field
    await profilesRef.doc(profileId).update({
      assets: admin.firestore.FieldValue.arrayUnion(newAsset)
    });

    // Extract freshly updated profile properties snapshot state block data
    const updatedDoc = await profilesRef.doc(profileId).get();
    const updatedData = updatedDoc.data();

    // Respond back using the refreshed asset collection state block context array
    res.json({ msg: "Asset linked successfully", assets: updatedData.assets || [] });
  } catch (err) {
    console.error("Asset Appending Server Failure:", err);
    res.status(500).json({ msg: "Server error handling asset addition" });
  }
});

/* UPDATE USER PROFILE */
router.put("/", auth, async (req, res) => {
  try {
    const profilesRef = db.collection("profiles");
    const snapshot = await profilesRef.where("userId", "==", req.user.id).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    const profileDoc = snapshot.docs[0];
    const profileId = profileDoc.id;

    // Remove immutable fields from payload if present
    const { userId, createdAt, assets, ...updateData } = req.body;

    await profilesRef.doc(profileId).update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await profilesRef.doc(profileId).get();
    res.json({ msg: "Profile updated successfully", profile: { id: profileId, ...updatedDoc.data() } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error updating profile" });
  }
});

module.exports = router;
