import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY;

export default function ShowPlayers() {
  const getUsername = Cookies.get("username");
  const API_URL = BASE_URL + "/getplayers";

  const [players, setPlayer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState({}); // ✅ per-player loading state

  useEffect(() => {
    axios
      .get(API_URL, {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        const sortedPlayers = res.data.sort((a, b) => {
          const aTime = a.createdAt?._seconds || 0;
          const bTime = b.createdAt?._seconds || 0;
          return bTime - aTime;
        });
        setPlayer(sortedPlayers);
        setLoading(false);
      })
      .catch((error) => {
        console.log("There was an error", error);
        setLoading(false);
      });
  }, []);

  // ✅ Handle status change with loader
    const handleStatusChange = async (playerId, newStatus) => {
        setStatusLoading((prev) => ({ ...prev, [playerId]: true }));

        try {
            await axios.post(
            `${BASE_URL}/addplayer`,
            {
                Id: playerId,
                Status: newStatus,
            },
            {
                headers: {
                Authorization: apiKey,
                "Content-Type": "application/json",
                },
            }
            );

            // ✅ Update UI locally
            setPlayer((prevPlayers) =>
            prevPlayers.map((p) =>
                p.Id === playerId ? { ...p, Status: newStatus } : p
            )
            );

            toast.success("Status updated successfully!");
        } catch (err) {
            console.error("Error updating status:", err);

            // ✅ Show backend error if available
            if (err.response && err.response.data && err.response.data.message) {
            toast.error(err.response.data.message);
            } else {
            toast.error("Failed to update status. Please try again.");
            }
        } finally {
            setStatusLoading((prev) => ({ ...prev, [playerId]: false }));
        }
    };

  // ✅ Search table
  const searchTable = () => {
    const input = document.getElementById("search");
    const filter = input.value.toLowerCase();
    const table = document.getElementById("Table");
    const rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName("td");
      let match = false;

      for (let j = 0; j < cells.length; j++) {
        if (cells[j]) {
          const cellValue = cells[j].textContent || cells[j].innerText;
          if (cellValue.toLowerCase().indexOf(filter) > -1) {
            match = true;
            break;
          }
        }
      }
      rows[i].style.display = match ? "" : "none";
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container">
      <ToastContainer position="top-center" />
      <h2>All Players Details</h2>
      <br />
      <div className="row">
        <div className="col-sm-3">
          <input
            type="text"
            className="form-control"
            id="search"
            placeholder="Search here..."
            onKeyUp={searchTable}
          />
        </div>
      </div>
      <br />
      <br />
      <table className="table table-striped table-light" id="Table">
        <thead>
          <tr>
            <th scope="col">Player Name</th>
            <th scope="col">Sports Category</th>
            <th scope="col">Event Name</th>
            <th scope="col">Event Date</th>
            <th scope="col">City / Location</th>
            <th scope="col">Email</th>
            <th scope="col">Jersey Number</th>
            <th scope="col">Status</th>
            <th scope="col">Stats</th>
            <th scope="col">Created At</th>
            <th scope="col">Delete</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const createdAt = player.createdAt?._seconds
              ? new Date(player.createdAt._seconds * 1000).toLocaleString()
              : "N/A";

            return (
              <tr key={player.Id}>
                <td>{player.PlayerName}</td>
                <td>{player.SportCategory}</td>
                <td>{player.EventName}</td>
                <td>{player.EventDate}</td>
                <td>{player.CityLocation}</td>
                <td>{player.Email}</td>
                <td>{player.JerseyNumber}</td>
                <td style={{ width: "150px" }}>
                  {statusLoading[player.Id] ? (
                    <Loader />
                  ) : (
                    <select
                      value={player.Status || "Pending"}
                      onChange={(e) =>
                        handleStatusChange(player.Id, e.target.value)
                      }
                      className="form-select"
                      style={{
                        backgroundColor:
                          player.Status === "Approved"
                            ? "#d4edda"
                            : player.Status === "Rejected"
                            ? "#f8d7da"
                            : "#fff3cd",
                        color:
                          player.Status === "Approved"
                            ? "#155724"
                            : player.Status === "Rejected"
                            ? "#721c24"
                            : "#856404",
                        fontWeight: "bold",
                      }}
                    >
                      <option
                        value="Pending"
                        style={{ backgroundColor: "#fff3cd", color: "#856404" }}
                      >
                        Pending
                      </option>
                      <option
                        value="Approved"
                        style={{ backgroundColor: "#d4edda", color: "#155724" }}
                      >
                        Approved
                      </option>
                      <option
                        value="Rejected"
                        style={{ backgroundColor: "#f8d7da", color: "#721c24" }}
                      >
                        Rejected
                      </option>
                    </select>
                  )}
                </td>
                <td style={{ width: "120px" }}>
                  <Link to={`/stats/${player.Id}`}>
                    <button className="btn btn-primary">See Stats</button>
                  </Link>
                </td>
                <td>{createdAt}</td>
                <td>
                  <Link to={`/deleteplayer/${player.Id}`}>
                    <i className="bi bi-trash3 text-danger"></i>
                  </Link>
                </td>
              </tr>
            );
          })}
          {players.length === 0 && (
            <tr>
              <td colSpan="11" className="text-center">
                No records available to show.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
