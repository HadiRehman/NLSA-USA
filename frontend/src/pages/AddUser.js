import React, { useState } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {toast, ToastContainer} from "react-toastify";
const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY;

export default function AddUser(){
    const API_URL = BASE_URL+"/adduser";
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const name = formData.get("username");
        const email = formData.get("email");
        const password = formData.get("password");
        const role = formData.get("role");
        
        if(!name || !email || !password || !role){
            toast.error("All fields are required!");
        }
        else{
            const data = {
                Role: role,
                Name: name,
                Email: email,
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
                    if(res.data.message == "Username already exist"){
                        toast.error("This username already exist!");
                    }
                    else{
                        navigate("/users")
                    }
                }
            )
            .catch(
                error => {
                    console.log(error);
                }
            )
        }
    }
    return(
        <div className="container">
            <ToastContainer />
            <h2>Add New User</h2>
            <br />
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-sm-6">
                        <input type="text" placeholder="Enter User Name" className="form-control" name="username" required/>
                    </div>
                    <div className="col-sm-6">
                        <input type="email" placeholder="Enter Email Here" className="form-control" name="email" required/>
                    </div>
                </div>
                <br />
                <div className="row">
                    <div className="col-sm-6">
                        <select className="form-control" name="role" required>
                            <option disabled selected>Select Role</option>
                            <option value="Administrator">Administrator</option>
                            <option value="User">User</option>
                        </select>
                    </div>
                    <div className="col-sm-6">
                        <input type="password" placeholder="Enter Password (Must be 8-20 characters long)" className="form-control" id="inputPassword5" name="password" required/>
                    </div>
                </div>
                <br />
                <div className="row">
                    <div className="col-sm-6">
                        <button className="btn btn-primary">Create User</button>
                    </div>
                </div>
            </form>
        </div>
    );
}