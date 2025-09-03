import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY;

export default function ShowStats() {
  const { id } = useParams(); // /stats/:id
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = `${BASE_URL}/getplayers`;
  const SAVE_URL = `${BASE_URL}/addplayer`;

  useEffect(() => {
    axios
      .get(API_URL, {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        const foundPlayer = res.data.find((p) => p.Id === id);
        setPlayer(foundPlayer || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching player stats:", error);
        toast.error("Failed to load player data.");
        setLoading(false);
      });
  }, [API_URL, id]);

  if (loading) return <Loader />;
  if (!player) return <p className="text-center mt-4">Player not found.</p>;

  const handleChange = (field, value) => {
    setPlayer((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        Id: player.Id,
        ...player,
        ...player.stats, // flatten stats into payload
      };

      const res = await axios.post(SAVE_URL, payload, {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      });

      toast.success(res.data.message || "Stats saved successfully!");
    } catch (error) {
      console.error("Error saving stats:", error);
      toast.error("Failed to save stats. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const stats = player.stats || {};

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">
        {player.PlayerName} – {player.SportCategory} Stat Sheet
      </h2>

      {/* Player Info */}
      <table className="table table-bordered w-75 mx-auto">
        <tbody>
          <tr>
            <td><strong>Player Name:</strong> {player.PlayerName}</td>
            <td><strong>Event Name:</strong> {player.EventName}</td>
          </tr>
          <tr>
            <td><strong>Event Date:</strong> {player.EventDate}</td>
            <td><strong>City/Location:</strong> {player.CityLocation}</td>
          </tr>
          <tr>
            <td><strong>Email:</strong> {player.Email}</td>
            <td><strong>Jersey Number:</strong> {player.JerseyNumber}</td>
          </tr>
        </tbody>
      </table>

      {/* Editable Stats Table */}
      <table className="table table-bordered w-75 mx-auto mt-4">
        <thead>
          <tr>
            <th>STAT CATEGORY</th>
            <th>VALUE</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["AtBats", "At Bats (AB)"],
            ["Hits", "Hits (H)"],
            ["Runs", "Runs (R)"],
            ["RBI", "RBI"],
            ["HR", "HR"],
            ["SB", "SB"],
            ["BB", "BB"],
            ["K", "K"],
            ["AVG", "AVG"],
            ["Errors", "Errors"],
            ["Assists", "Assists"],
            ["Putouts", "Putouts"],
            ["PitchingInnings", "Pitching Innings"],
            ["PitchingStrikeouts", "Pitching Strikeouts"],
            ["ERA", "ERA"],
          ].map(([key, label]) => (
            <tr key={key}>
              <td>{label}</td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={stats[key] ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-center mt-4">
        <button
          className="btn btn-success me-2"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Stats"}
        </button>
        <Link to="/players" className="btn btn-secondary">
          Back to Players
        </Link>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-center" />
    </div>
  );
}