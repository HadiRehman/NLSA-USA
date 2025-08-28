import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import Cookies from "js-cookie";
const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY;

export default function ShowPlayers(){
    const getUsername = Cookies.get("username");

    const API_URL = BASE_URL+"/getplayers";

    const [players, setPlayer] = useState([]);

    useEffect(() => {
        axios.get(API_URL, {
            headers: {
                "Authorization": apiKey,
                "Content-Type": "application/json"
            }
        })
        .then(
            res => {
                setPlayer(res.data);
                setLoading(false);
            }
        )
        .catch(
            error => {
                console.log("There was an error", error)
            }
        )
    }, [])

    // search table code..
    const searchTable = (e) => {
        const input = document.getElementById("search");
        const filter = input.value.toLowerCase();
        const table = document.getElementById("Table");
        const rows = table.getElementsByTagName("tr");
    
        for (let i = 1; i < rows.length; i++) { // Start at 1 to skip the header row
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
    }
    const [loading, setLoading] = useState(true);
    if (loading) return <Loader />;
    return(
        <div className="container">
            <h2>All Players Details</h2>
            <br />
            <div className="row">
                <div className="col-sm-3">
                    <input type="text" class="form-control" id="search" placeholder="Search here..." onKeyUp={searchTable} />
                </div>
            </div>
            <br /><br />
            <table className="table table-striped table-light" id="Table">
                <thead>
                    <tr>
                        <th scope="col">Sports Category</th>
                        <th scope="col">Player Name</th>
                        <th scope="col">Event Name</th>
                        <th scope="col">Date Of Birth</th>
                        <th scope="col">City / Location</th>
                        <th scope="col">Email</th>
                        <th scope="col">Jersey Number</th>
                        <th scope="col">Show Stats</th>
                        <th scope="col">Created At</th>
                        <th scope="col">Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map(player => {
                        // ✅ Convert Firestore timestamp to Date
                        const createdAt = player.createdAt?._seconds
                        ? new Date(player.createdAt._seconds * 1000).toLocaleString()
                        : "N/A";

                        return (
                        <tr key={player.Id}>
                            <td>{player.SportCategory}</td>
                            <td>{player.PlayerName}</td>
                            <td>{player.EventName}</td>
                            <td>{player.DateOfBirth}</td>
                            <td>{player.CityLocation}</td>
                            <td>{player.Email}</td>
                            <td>{player.JerseyNumber}</td>
                            <td><Link to={`/stats/${player.Id}`}><button className="btn btn-primary">See Stats</button></Link></td>
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
                        <td colSpan="9" className="text-center">
                            No records available to show.
                        </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}