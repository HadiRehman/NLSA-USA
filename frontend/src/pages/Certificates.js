// src/pages/Certificate.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY;

export default function Certificate() {
  const getUsername = Cookies.get("username");
  const API_URL = BASE_URL + "/getplayers";

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState({}); // per-player sending loader

  // ✅ Load Approved Players only
  useEffect(() => {
    axios
      .get(API_URL, {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        const approved = res.data.filter((p) => p.Status === "Approved");
        setPlayers(approved);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching players:", error);
        setLoading(false);
      });
  }, []);

  // ✅ Send Certificate Email (new endpoint)
  const handleSendCertificate = async (player) => {
    setSending((prev) => ({ ...prev, [player.Id]: true }));
    try {
      await axios.post(
        `${BASE_URL}/send-certificate`,
        { playerId: player.Id },
        {
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(`Certificate sent to ${player.Email}`);
    } catch (err) {
      console.error("Error sending certificate:", err);
      toast.error("Failed to send certificate");
    } finally {
      setSending((prev) => ({ ...prev, [player.Id]: false }));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container">
      <ToastContainer position="top-center" />
      <h2>Approved Certificates</h2>
      <br />
      <table className="table table-striped table-light">
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Sports Category</th>
            <th>Event Date</th>
            <th>Email</th>
            <th>View Certificate</th>
            <th>Send Certificate</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.Id}>
              <td>{player.PlayerName}</td>
              <td>{player.SportCategory}</td>
              <td>{player.EventDate}</td>
              <td>{player.Email}</td>
              <td>
                <a
                  href={`${BASE_URL}/certificate/${player.Id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-dark btn-sm"
                >
                  View Certificate
                </a>
              </td>
              <td>
                {sending[player.Id] ? (
                  <Loader />
                ) : (
                  <button
                    onClick={() => handleSendCertificate(player)}
                    className="btn btn-success btn-sm"
                  >
                    Resend Certificate
                  </button>
                )}
              </td>
            </tr>
          ))}
          {players.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center">
                No approved certificates available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
