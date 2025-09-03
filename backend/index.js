import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import nodemailer  from "nodemailer";

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

app.get("/getactiveusers", authenticateApiKey, (req, res) => {
  if (realTimeUsers !== null && Date.now() < expiryTime) {
    res.json({ number: realTimeUsers });
  } else {
    realTimeUsers = 0; // Reset value after expiry
    expiryTime = null;
    res.json({ message: "Value expired" });
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

// stats api
// ✅ Google SMTP Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // your Gmail address
    pass: process.env.GMAIL_PASS, // app password (not your actual Gmail password!)
  },
});

// ✅ Add or Update Player
app.post("/addplayer", authenticateApiKey, async (req, res) => {
  const {
    Id, // optional for update
    SportCategory,
    PlayerName,
    EventName,
    EventDate,
    CityLocation,
    Email,
    JerseyNumber,
    documentFile,
    videoFile,
    Status, // Pending | Approved | Rejected
    // optional stats (may come as numbers or strings)
    AtBats,
    Hits,
    Runs,
    RBI,
    HR,
    SB,
    BB,
    K,
    AVG,
    Errors,
    Assists,
    Putouts,
    PitchingInnings,
    PitchingStrikeouts,
    ERA,
  } = req.body;

  if (
    !Id &&
    (!SportCategory ||
      !PlayerName ||
      !EventName ||
      !EventDate ||
      !CityLocation ||
      !Email ||
      !JerseyNumber)
  ) {
    return res
      .status(400)
      .json({ message: "All player info fields are required for new player!" });
  }

  try {
    // ✅ Case 1: Update existing player
    if (Id) {
      const playerRef = db.collection("players").doc(Id);
      const playerDoc = await playerRef.get();

      if (!playerDoc.exists) {
        return res.status(404).json({ message: "Player not found" });
      }

      const existingData = playerDoc.data() || {};
      const existingStats = existingData.stats || {};

      // Helpers
      const isMissing = (v) =>
        v === undefined ||
        v === null ||
        (typeof v === "string" && v.trim() === "");

      const pickVal = (incoming, fallback) =>
        incoming !== undefined ? incoming : fallback;

      // 🔒 If moving to Approved, ensure required stats are present (incoming OR existing)
      if (Status === "Approved" && existingData.Status !== "Approved") {
        const required = {
          AtBats: pickVal(AtBats, existingStats.AtBats),
          Hits: pickVal(Hits, existingStats.Hits),
          Runs: pickVal(Runs, existingStats.Runs),
          RBI: pickVal(RBI, existingStats.RBI),
          HR: pickVal(HR, existingStats.HR),
          SB: pickVal(SB, existingStats.SB),
          BB: pickVal(BB, existingStats.BB),
          K: pickVal(K, existingStats.K),
          AVG: pickVal(AVG, existingStats.AVG),
        };

        const missingFields = Object.entries(required)
          .filter(([, val]) => isMissing(val))
          .map(([key]) => key);

        if (missingFields.length) {
          return res.status(400).json({
            message:
              "Stats are required when approving a player.",
            missing: missingFields, // helpful for the client
          });
        }
      }

      // Build updates
      const updates = {};
      if (SportCategory) updates.SportCategory = SportCategory;
      if (PlayerName) updates.PlayerName = PlayerName;
      if (EventName) updates.EventName = EventName;
      if (EventDate) updates.EventDate = EventDate;
      if (CityLocation) updates.CityLocation = CityLocation;
      if (Email) updates.Email = Email;
      if (JerseyNumber) updates.JerseyNumber = JerseyNumber;
      if (documentFile) updates.documentFile = documentFile;
      if (videoFile) updates.videoFile = videoFile;
      if (Status) updates.Status = Status;

      // Merge stats (only keys provided in request)
      const statsUpdates = {};
      if (AtBats !== undefined) statsUpdates.AtBats = AtBats;
      if (Hits !== undefined) statsUpdates.Hits = Hits;
      if (Runs !== undefined) statsUpdates.Runs = Runs;
      if (RBI !== undefined) statsUpdates.RBI = RBI;
      if (HR !== undefined) statsUpdates.HR = HR;
      if (SB !== undefined) statsUpdates.SB = SB;
      if (BB !== undefined) statsUpdates.BB = BB;
      if (K !== undefined) statsUpdates.K = K;
      if (AVG !== undefined) statsUpdates.AVG = AVG;
      if (Errors !== undefined) statsUpdates.Errors = Errors;
      if (Assists !== undefined) statsUpdates.Assists = Assists;
      if (Putouts !== undefined) statsUpdates.Putouts = Putouts;
      if (PitchingInnings !== undefined) statsUpdates.PitchingInnings = PitchingInnings;
      if (PitchingStrikeouts !== undefined) statsUpdates.PitchingStrikeouts = PitchingStrikeouts;
      if (ERA !== undefined) statsUpdates.ERA = ERA;

      if (Object.keys(statsUpdates).length > 0) {
        updates["stats"] = statsUpdates;
      }

      await playerRef.set(updates, { merge: true });

      // 📧 Email on status change to Approved/Rejected
      if (
        Status &&
        (Status === "Approved" || Status === "Rejected") &&
        existingData.Status !== Status
      ) {
        const recipientEmail = existingData.Email || Email;
        if (recipientEmail) {
          const subject =
            Status === "Approved"
              ? `Your Stats for ${existingData.SportCategory || SportCategory} has been Approved`
              : "Your Stats has been Rejected";

          const message =
            Status === "Approved"
              ? `Hello ${existingData.PlayerName || PlayerName},\n\nYour player registration has been approved. You can now participate in the event.\n\nThanks,\nTeam`
              : `Hello ${existingData.PlayerName || PlayerName},\n\nUnfortunately, your player registration has been rejected.\n\nThanks,\nTeam`;

          await transporter.sendMail({
            from: `"Sports App" <${process.env.GMAIL_USER}>`,
            to: recipientEmail,
            subject,
            text: message,
          });

          console.log(`📧 Email sent to ${recipientEmail} about status: ${Status}`);
        }
      }

      return res.status(200).json({ message: "Player updated successfully" });
    }

    // ✅ Case 2: Create new player
    const newPlayer = {
      SportCategory,
      PlayerName,
      EventName,
      EventDate,
      CityLocation,
      Email,
      JerseyNumber,
      documentFile: documentFile || null,
      videoFile: videoFile || null,
      Status: "Pending",
      stats: {
        AtBats: AtBats || null,
        Hits: Hits || null,
        Runs: Runs || null,
        RBI: RBI || null,
        HR: HR || null,
        SB: SB || null,
        BB: BB || null,
        K: K || null,
        AVG: AVG || null,
        Errors: Errors || null,
        Assists: Assists || null,
        Putouts: Putouts || null,
        PitchingInnings: PitchingInnings || null,
        PitchingStrikeouts: PitchingStrikeouts || null,
        ERA: ERA || null,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const playerRef = await db.collection("players").add(newPlayer);
    return res.status(200).json({ message: "Player added successfully", Id: playerRef.id });
  } catch (error) {
    console.error("🔥 Error adding/updating player:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


// ✅ Fetch All Players
app.get("/getplayers", authenticateApiKey, async (req, res) => {
  try {
    const snapshot = await db.collection("players").get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No players found" });
    }

    const players = snapshot.docs.map((doc) => ({
      Id: doc.id,
      ...doc.data(),
    }));

    res.json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ message: "Firebase error", error: error.message });
  }
});

// ✅ Update Player (info or stats)
app.put("/updateplayer", authenticateApiKey, async (req, res) => {
  const { Id, ...updateFields } = req.body;

  if (!Id) {
    return res.status(400).json({ message: "Player Id required!" });
  }

  try {
    const playerRef = db.collection("players").doc(Id);
    const playerDoc = await playerRef.get();

    if (!playerDoc.exists) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Separate stats updates
    const { AtBats, Hits, Runs, RBI, HR, SB, BB, K, AVG, Errors, Assists, Putouts, PitchingInnings, PitchingStrikeouts, ERA, ...playerInfo } = updateFields;

    const updates = {};
    if (Object.keys(playerInfo).length > 0) {
      Object.assign(updates, playerInfo);
    }

    // ✅ Update stats only if provided
    const statsUpdates = {};
    if (AtBats !== undefined) statsUpdates.AtBats = AtBats;
    if (Hits !== undefined) statsUpdates.Hits = Hits;
    if (Runs !== undefined) statsUpdates.Runs = Runs;
    if (RBI !== undefined) statsUpdates.RBI = RBI;
    if (HR !== undefined) statsUpdates.HR = HR;
    if (SB !== undefined) statsUpdates.SB = SB;
    if (BB !== undefined) statsUpdates.BB = BB;
    if (K !== undefined) statsUpdates.K = K;
    if (AVG !== undefined) statsUpdates.AVG = AVG;
    if (Errors !== undefined) statsUpdates.Errors = Errors;
    if (Assists !== undefined) statsUpdates.Assists = Assists;
    if (Putouts !== undefined) statsUpdates.Putouts = Putouts;
    if (PitchingInnings !== undefined) statsUpdates.PitchingInnings = PitchingInnings;
    if (PitchingStrikeouts !== undefined) statsUpdates.PitchingStrikeouts = PitchingStrikeouts;
    if (ERA !== undefined) statsUpdates.ERA = ERA;

    if (Object.keys(statsUpdates).length > 0) {
      updates["stats"] = { ...playerDoc.data().stats, ...statsUpdates };
    }

    await playerRef.update(updates);

    return res.status(200).json({ message: "Player updated successfully" });
  } catch (error) {
    console.error("🔥 Update error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Delete Player
app.delete("/deleteplayer/:Id", authenticateApiKey, async (req, res) => {
  const { Id } = req.params;
  if (!Id) {
    return res.status(400).json({ message: "Player Id required!" });
  }

  try {
    await db.collection("players").doc(Id).delete();
    return res.status(200).json({ message: "Player deleted successfully" });
  } catch (error) {
    console.error("🔥 Delete error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
