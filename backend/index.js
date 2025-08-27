import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


const API_KEY = process.env.API_KEY;

// 🔑 Middleware to check API Key
const authenticateApiKey = (req, res, next) => {
  const clientKey = req.header("Authorization");
  if (clientKey && clientKey === API_KEY) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden - Invalid API Key" });
};

// 🔥 Firebase init
const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf-8")
);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase connected");
}
const db = admin.firestore();

// Global login tracking (like your realTimeUsers logic)
let realTimeUsers = 0;
let expiryTime = null;
const saltRounds = 10;

// ✅ Add User
app.post("/adduser", authenticateApiKey, async (req, res) => {
  const { Role, Name, Email, Password } = req.body;
  if (!Role || !Name || !Email || !Password) {
    return res.status(400).json({ message: "All fields required!" });
  }

  try {
    const existing = await db
      .collection("users")
      .where("Name", "==", Name)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    await db.collection("users").add({
      Role,
      Name,
      Email,
      Password: hashedPassword,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ message: "User added successfully" });
  } catch (error) {
    console.error("🔥 Error adding user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Fetch all users
app.get("/getusers", authenticateApiKey, async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No users found" });
    }

    const users = snapshot.docs.map((doc) => ({
      Id: doc.id,
      ...doc.data(),
    }));

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Firebase error", error: error.message });
  }
});

// ✅ Login
app.post("/login", authenticateApiKey, async (req, res) => {
  const { Username, Password } = req.body;
  if (!Username || !Password) {
    return res.status(400).json({ message: "All fields required!" });
  }

  try {
    const snapshot = await db
      .collection("users")
      .where("Name", "==", Username)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ message: "Invalid Username or Password" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const passwordMatch = await bcrypt.compare(Password, userData.Password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid Username or Password" });
    }

    realTimeUsers++;
    expiryTime = Date.now() + 5 * 60 * 60 * 1000; // 5 hours

    return res
      .status(200)
      .json({ message: "User Authenticated successfully", role: userData.Role });
  } catch (error) {
    console.error("🔥 Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Logout
app.post("/logout", authenticateApiKey, (req, res) => {
  if (realTimeUsers !== null && Date.now() < expiryTime) {
    realTimeUsers--;
    return res.status(200).json({ number: realTimeUsers });
  } else {
    return res.json({ message: "Value expired" });
  }
});

// ✅ Update User
app.put("/updateuser", authenticateApiKey, async (req, res) => {
  const { Name, Email, oldPassword, newPassword, Id } = req.body;

  if (!Name || !Email || !Id) {
    return res.status(400).json({ message: "All fields required!" });
  }

  try {
    const userRef = db.collection("users").doc(Id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data();

    // 🔎 Check if username already exists (but ignore current user)
    const existingUsers = await db
      .collection("users")
      .where("Name", "==", Name)
      .get();

    if (!existingUsers.empty) {
      const duplicate = existingUsers.docs.find((doc) => doc.id !== Id);
      if (duplicate) {
        return res.status(400).json({ message: "Username already exist" });
      }
    }

    // ✅ Case 1: No password change
    if (!newPassword && !oldPassword) {
      await userRef.update({ Name, Email });
      return res.status(200).json({ message: "User Profile Updated Successfully." });
    }

    // ✅ Case 2: Password change
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new passwords are required to change password" });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, userData.Password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Password not match" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRef.update({ Name, Email, Password: hashedPassword });

    return res.status(200).json({ message: "User Profile Updated Successfully." });

  } catch (error) {
    console.error("🔥 Update error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Delete User
app.delete("/deleteuser/:Id", authenticateApiKey, async (req, res) => {
  const { Id } = req.params;
  if (!Id) {
    return res.status(400).json({ message: "All fields required!" });
  }

  try {
    await db.collection("users").doc(Id).delete();
    return res.status(200).json({ message: "User Deleted Successfully." });
  } catch (error) {
    console.error("🔥 Delete error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
