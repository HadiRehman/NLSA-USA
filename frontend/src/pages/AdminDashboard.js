import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY;

export default function AdminDashboard(){
    const getRole = Cookies.get("user_role");
    const getUsername = Cookies.get("username");

    const GET_USERS = BASE_URL+"/getusers";
    const GET_COUNTRIES = BASE_URL+"/getcountries";
    const GET_DATA = BASE_URL+"/getleads";
    const REALTIME_USERS = BASE_URL+"/getactiveusers";

    const [users, setUser] = useState([]);
    const [countries, setCountry] = useState([]);
    const [data, setData] = useState([]);
    const [activeUsers, setActiveUsers] = useState("");


    useEffect(() => {
        axios.get(GET_USERS, {
            headers: {
                "Authorization": apiKey,
                "Content-Type": "application/json"
            }
        })
        .then(
            res => {
                setUser(res.data);
            }
        )
        .catch(
            error => {
                console.log(error);
            }
        )

        axios.get(GET_COUNTRIES, {
            headers: {
                "Authorization": apiKey,
                "Content-Type": "application/json"
            }
        })
        .then(
            res => {
                setCountry(res.data);
            }
        )
        .catch(
            error => {
                console.log(error);
            }
        )

        axios.get(GET_DATA, {
            headers: {
                "Authorization": apiKey,
                "Content-Type": "application/json"
            }
        })
        .then(
            res => {
                setData(res.data);
                setLoading(false);
            }
        )
        .catch(
            error => {
                console.log(error);
            }
        )

        axios.get(REALTIME_USERS, {
            headers: {
                "Authorization": apiKey,
                "Content-Type": "application/json"
            }
        })
        .then(
            res => {
                setActiveUsers(res.data.number);
                setLoading(false);
                // console.log(res.data);
            }
        )
        .catch(
            error => {
                console.log(error);
            }
        )
    }, [])
    
    const [loading, setLoading] = useState(true);
    if (loading) return <Loader />;
    return(
        <div className="container">
            <h2>Welcome, "{getUsername}"</h2>
            <br />
            <div className="row">
                {getRole == "Administrator" && 
                <div class="card" style={{width: "20rem", margin: "10px"}}>
                    <div class="card-body">
                        <h5 class="card-title">Current Users</h5>
                        <h4 class="card-subtitle mb-2 text-success">{users.length}</h4>
                        <Link to="users" class="card-link">Manage Users</Link>
                    </div>
                </div>
                }
                {getRole == "Administrator" && 
                <div class="card" style={{width: "20rem", margin: "10px"}}>
                    <div class="card-body">
                        <h5 class="card-title">Total Countries</h5>
                        <h4 class="card-subtitle mb-2 text-success">{countries.length}</h4>
                        <Link to="countries" class="card-link">Manage Countries</Link>
                    </div>
                </div>
                }
                <div class="card" style={{width: "20rem", margin: "10px"}}>
                    <div class="card-body">
                        <h5 class="card-title">Total Leads</h5>
                        <h4 class="card-subtitle mb-2 text-success">{data.length}</h4>
                        {getRole == "Administrator" && 
                        <Link to="allleads" class="card-link">Manage Leads</Link>
                        }
                    </div>
                </div>
            </div>
            {getRole == "Administrator" && 
                <h3>Realtime Users: {activeUsers}</h3>
            }
        </div>
    )
}