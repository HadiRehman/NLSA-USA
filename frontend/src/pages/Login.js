import React, { useState } from "react";
import Cookies from "js-cookie";
import {toast, ToastContainer} from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY;

export default function Login(){
    const API_URL = BASE_URL+"/login";

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const username = formData.get("uname");
        const password = formData.get("pass");

        const data = {
            Username: username,
            Password: password
        }
        axios.post(API_URL, data, {
            headers: {
                "Authorization": apiKey,
                "Content-Type": "application/json"
            }
        })
        .then(
            res => {
                console.log(res.data.message);
                if(res.data.message !== ""){
                    setLoading(true);
                    const userRole = res.data.role;
                    let date = new Date();
                    date.setTime(date.getTime() + 10 * 60 * 60 * 1000);
                    Cookies.set("username", username, {expires: date});
                    Cookies.set("user_role", userRole, {expires: date});
                    navigate(0);
                }
                else{
                    toast.error("Invalid username!");
                }
            }
        )
        .catch(
            error => {
                toast.error("Login Failed!");
                console.log(error);
            }
        )
    }
    const [loading, setLoading] = useState(false);
    if (loading) return <Loader />;
    return(
        <div className="container">
            <ToastContainer />
            <br /><br />
            <center>
                <h2 className="text-center text-dark">Login Here</h2>
                <br />
                <form onSubmit={handleSubmit}>
                    <div className="col-sm-4">
                        <input type="text" className="form-control" placeholder="Enter username" name="uname" /><br />
                    </div>
                    <div className="col-sm-4">
                        <input type="password" className="form-control" placeholder="Enter password" name="pass" /><br />
                    </div>
                    <div className="col-sm-3">
                        <button className="btn btn-dark">Login</button>
                    </div>
                </form>
            </center>
        </div>
    )
}