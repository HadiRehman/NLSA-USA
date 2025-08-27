import express from "express";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { readFileSync } from "fs";

dotenv.config();

const app = express();
app.use(express.json());

// Load service account JSON directly
const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf-8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase connected (using serviceAccountKey.json)");
}

const db = admin.firestore();

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newUserRef = await db.collection("users").add({
      name,
      email,
      password,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      message: "User signed up successfully",
      userId: newUserRef.id,
    });
  } catch (error) {
    console.error("🔥 Error inserting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
