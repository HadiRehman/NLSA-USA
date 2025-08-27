import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import Cookies from "js-cookie";
const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY;

export default function ShowUsers(){
    const getUsername = Cookies.get("username");

    const API_URL = BASE_URL+"/getusers";

    const [users, setUser] = useState([]);

    useEffect(() => {
        axios.get(API_URL, {
            headers: {
                "Authorization": apiKey,
                "Content-Type": "application/json"
            }
        })
        .then(
            res => {
                setUser(res.data);
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
            <div className="row">
                <div className="col-sm-2">
                    <Link to="/adduser"><button className="btn btn-primary">Add New User</button></Link>
                </div>
                <div className="col-sm-3">
                    <input type="text" class="form-control" id="search" placeholder="Search here..." onKeyUp={searchTable} />
                </div>
            </div>
            <br /><br />
            <table className="table table-striped table-light" id="Table">
                <thead>
                    <tr>
                        <th scope="col">User Name</th>
                        <th scope="col">Role</th>
                        <th scope="col">Email</th>
                        <th scope="col">Create At</th>
                        <th scope="col">Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => {
                        // ✅ Convert Firestore timestamp to Date
                        const createdAt = user.createdAt?._seconds
                        ? new Date(user.createdAt._seconds * 1000).toLocaleString()
                        : "N/A";

                        return (
                        <tr key={user.id}>
                            <td>{user.Name}</td>
                            <td>{user.Role}</td>
                            <td>{user.Email}</td>
                            <td>{createdAt}</td>
                            <td>
                            {getUsername !== user.Name && (
                                <Link to={`/deleteuser/${user.id}`}>
                                <i className="bi bi-trash3 text-danger"></i>
                                </Link>
                            )}
                            </td>
                        </tr>
                        );
                    })}
                    {users.length === 0 && (
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