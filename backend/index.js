import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

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
    DocumentFile,
    VideoFile,
    Status, // Pending | Approved | Rejected
    // optional stats
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

  try {
    // === UPDATE CASE ===
    if (Id) {
      const playerRef = db.collection("players").doc(Id);
      const playerDoc = await playerRef.get();
      if (!playerDoc.exists) return res.status(404).json({ message: "Player not found" });

      const existingData = playerDoc.data() || {};
      const existingStats = existingData.stats || {};

      const isMissing = (v) =>
        v === undefined || v === null || (typeof v === "string" && v.trim() === "");

      const pickVal = (incoming, fallback) =>
        incoming !== undefined ? incoming : fallback;

      // 🔒 Require stats if moving to Approved
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
            message: "Stats are required when approving a player.",
            missing: missingFields,
          });
        }
      }

      // Build update object
      const updates = {};
      if (SportCategory) updates.SportCategory = SportCategory;
      if (PlayerName) updates.PlayerName = PlayerName;
      if (EventName) updates.EventName = EventName;
      if (EventDate) updates.EventDate = EventDate;
      if (CityLocation) updates.CityLocation = CityLocation;
      if (Email) updates.Email = Email;
      if (JerseyNumber) updates.JerseyNumber = JerseyNumber;
      if (DocumentFile) updates.DocumentFile = DocumentFile;
      if (VideoFile) updates.VideoFile = VideoFile;
      if (Status) updates.Status = Status;

      // Merge stats
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
        updates["stats"] = { ...existingStats, ...statsUpdates };
      }

      await playerRef.set(updates, { merge: true });

      // === EMAIL ON STATUS CHANGE ===
      if (
        Status &&
        (Status === "Approved" || Status === "Rejected") &&
        existingData.Status !== Status
      ) {
        const recipientEmail = existingData.Email || Email;
        if (recipientEmail) {
          if (Status === "Approved") {
            // Generate certificate PDF
            const doc = new PDFDocument({ size: "A4", margin: 50 });
            let buffers = [];
            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", async () => {
              const pdfBuffer = Buffer.concat(buffers);

              await transporter.sendMail({
                from: `"Sports App" <${process.env.GMAIL_USER}>`,
                to: recipientEmail,
                subject: `Your Certificate - ${
                  existingData.SportCategory || SportCategory
                }`,
                text: `Hello ${
                  existingData.PlayerName || PlayerName
                },\n\nCongratulations! Please find your attached certificate.\n\nThanks,\nTeam`,
                attachments: [
                  {
                    filename: `Certificate-${Id}.pdf`,
                    content: pdfBuffer,
                  },
                ],
              });

              console.log(`📧 Certificate emailed to ${recipientEmail}`);
            });

            // === Certificate UI Layout ===
            // Border
            doc.rect(20, 20, 555, 800).strokeColor("#1a73e8").lineWidth(4).stroke();

            // Header / Title
            doc.fontSize(26)
              .fillColor("#1a73e8")
              .font("Helvetica-Bold")
              .text("NLSA USA – Certificate of Achievement", {
                align: "center",
                underline: true,
              });
            doc.moveDown(1);

            // Sub-title
            doc.fontSize(16)
              .fillColor("black")
              .font("Helvetica")
              .text("This certificate is proudly presented to", {
                align: "center",
              });
            doc.moveDown(1);

            // Player Name
            doc.fontSize(25)
              .fillColor("black")
              .font("Helvetica-Bold")
              .text(`${PlayerName || existingData.PlayerName}`, {
                align: "center",
              });
            doc.moveDown(0.5);

            // Challenge / Event
            doc.fontSize(14)
              .fillColor("black")
              .font("Helvetica")
              .text(
                `For outstanding performance in the ${
                  SportCategory || existingData.SportCategory
                } challenge`,
                { align: "center" }
              );
            doc.moveDown(1);

            // Event Info Section
            doc.fontSize(14)
              .fillColor("#333")
              .font("Helvetica")
              .text(`Event: ${EventName || existingData.EventName}`, {
                align: "center",
              });
            doc.text(`Date: ${EventDate || existingData.EventDate}`, {
              align: "center",
            });
            doc.text(
              `Jersey Number: ${JerseyNumber || existingData.JerseyNumber}`,
              { align: "center" }
            );
            doc.moveDown(0.5);

            // === Highlight Stats Section ===
            doc.moveDown(1)
              .fontSize(16)
              .fillColor("#1a73e8")
              .font("Helvetica-Bold")
              .text("Highlight Stats", { align: "center" });
            doc.moveDown(1);

            // Define stats in key-value pairs
            const stats = [
              { label: "At Bats (AB)", value: AtBats || existingStats.AtBats || "N/A" },
              { label: "Hits (H)", value: Hits || existingStats.Hits || "N/A" },
              { label: "Runs (R)", value: Runs || existingStats.Runs || "N/A" },
              { label: "RBI", value: RBI || existingStats.RBI || "N/A" },
              { label: "HR", value: HR || existingStats.HR || "N/A" },
              { label: "SB", value: SB || existingStats.SB || "N/A" },
              { label: "BB", value: BB || existingStats.BB || "N/A" },
              { label: "K", value: K || existingStats.K || "N/A" },
              { label: "AVG", value: AVG || existingStats.AVG || "N/A" },
              { label: "Errors", value: Errors || existingStats.Errors || "N/A" },
              { label: "Assists", value: Assists || existingStats.Assists || "N/A" },
              { label: "Putouts", value: Putouts || existingStats.Putouts || "N/A" },
              {
                label: "Pitching Innings",
                value: PitchingInnings || existingStats.PitchingInnings || "N/A",
              },
              {
                label: "Pitching Strikeouts",
                value: PitchingStrikeouts || existingStats.PitchingStrikeouts || "N/A",
              },
              { label: "ERA", value: ERA || existingStats.ERA || "N/A" },
            ];

            // Table-like display
            let startX = 100;
            let startY = doc.y;
            let rowHeight = 22;
            let col1Width = 200;
            let col2Width = 150;

            stats.forEach((stat, i) => {
              // Alternate row background
              if (i % 2 === 0) {
                doc.rect(startX, startY + i * rowHeight, col1Width + col2Width, rowHeight)
                  .fillColor("#f5f5f5")
                  .fill();
              }

              // Write stat category
              doc.fillColor("black")
                .font("Helvetica-Bold")
                .fontSize(12)
                .text(stat.label, startX + 5, startY + i * rowHeight + 5, {
                  width: col1Width,
                });

              // Write stat value
              doc.font("Helvetica")
                .fillColor("#d32f2f")
                .fontSize(12)
                .text(stat.value, startX + col1Width + 10, startY + i * rowHeight + 5, {
                  width: col2Width,
                });
            });

            doc.moveDown(3);

            // === CERTIFICATE ID (LEFT) + SIGNATURE (RIGHT) ===
            const pageWidth = doc.page.width;
            const margin = 50;
            const yPos = doc.y; // current vertical position

                        // Certificate ID (left)
            doc
              .fontSize(12)
              .fillColor("#555")
              .text(`Certificate ID: CERT-${new Date().getFullYear()}-${Id}`, margin, yPos+20, {
                align: "left",
              });

            // Signature block (right)
            doc
              .fontSize(12)
              .fillColor("#000")
              .font("Helvetica-Bold")
              .text("Admin", pageWidth / 2, yPos, { align: "right" })
              .font("Helvetica")
              .text("__________________________", pageWidth / 2, doc.y, { align: "right" })
              .font("Helvetica-Bold")
              .text("Authorized League Official", pageWidth / 2, doc.y, { align: "right" })
              .font("Helvetica")
              .text("NLSA USA", pageWidth / 2, doc.y, { align: "right" });
            // === FOOTER (CENTER) ===
            // === FOOTER (BOTTOM CENTER) ===
            const footerY = doc.page.height - 40; // 40px above bottom edge
              doc
              .fontSize(10)
              .fillColor("#888")
              .text("© NLSA USA | www.nlsausa.com", 230, footerY, {
                align: "center",
                width: "100%",
              });
              doc.moveDown(1);

            doc.end();
          } else {
            // Send rejection email
            await transporter.sendMail({
              from: `"Sports App" <${process.env.GMAIL_USER}>`,
              to: recipientEmail,
              subject: "Your Stats have been Rejected",
              text: `Hello ${
                existingData.PlayerName || PlayerName
              },\n\nUnfortunately, your player registration has been rejected.\n\nThanks,\nTeam`,
            });
          }
        }
      }

      return res.status(200).json({ message: "Player updated successfully" });
    }

    // === CREATE CASE ===
    const newPlayer = {
      SportCategory,
      PlayerName,
      EventName,
      EventDate,
      CityLocation,
      Email,
      JerseyNumber,
      DocumentFile: DocumentFile || null,
      VideoFile: VideoFile || null,
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
