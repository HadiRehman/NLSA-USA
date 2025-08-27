import axios from "axios";
import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {toast, ToastContainer} from "react-toastify";
import Loader from "../components/Loader";
import Cookies from "js-cookie";
const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY; 

export default function UpdateProfile(){
    const getUsername = Cookies.get("username");
    const navigate = useNavigate();

    //getting user data
    const GET_USER = BASE_URL+"/getusers";
    const [user, setUser] = useState([]);
    useEffect(() => {
        axios.get(GET_USER, {
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

    //updating profile
    const handleSubmit = (e) => {
        e.preventDefault();

        const UPDATE_URL = BASE_URL+"/updateuser";


        const formData = new FormData(e.target);
        const name = formData.get("name");
        const email = formData.get("email");
        const previous_pass = formData.get("previous_pass");
        const new_pass = formData.get("new_pass");
        const getpassword = formData.get("getpassword");
        const getid = formData.get("getid");
        
        if(previous_pass != "" && !new_pass){
            toast.error("Enter new password to reset the password!");
        }

        if(!previous_pass && !new_pass){
            const data = {
                Name: name,
                Email: email,
                Id: getid
            }
            axios.put(UPDATE_URL, data, {
                headers: {
                    "Authorization": apiKey,
                    "Content-Type": "application/json"
                }
            })
            .then(
                res => {
                    if(res.data.message = "User Profile Updated Successfully."){
                        toast.success("Profile updated successfully.");
                        let date = new Date();
                        date.setTime(date.getTime() + 5 * 60 * 60 * 1000);
                        Cookies.set("username", name, {expires: date});
                        setTimeout(() => {
                            navigate("/"); // Change "/new-page" to your target route
                        }, 2000);
                    }
                    // console.log(res);
                }
            )
            .catch(
                error => {
                    if(error.response.data.message == "Username already exist"){
                        toast.error("This username exists! try another one.");
                    }
                    console.log(error);
                }
            )
        }
        else{
            const data = {
                Name: name,
                Email: email,
                oldPassword: previous_pass,
                newPassword: new_pass,
                Id: getid
            }
            axios.put(UPDATE_URL, data, {
                headers: {
                    "Authorization": apiKey,
                    "Content-Type": "application/json"
                }
            })
            .then(
                res => {
                    console.log(res.data);
                    if(res.data.message == "User Profile Updated Successfully."){
                        toast.success("Profile updated successfully.");
                        let date = new Date();
                        date.setTime(date.getTime() + 5 * 60 * 60 * 1000);
                        Cookies.set("username", name, {expires: date});
                        setTimeout(() => {
                            navigate("/"); // Change "/new-page" to your target route
                        }, 2000);
                    }
                    else{
                        toast.error("Password does not match!");
                    }
                }
            )
            .catch(
                error => {
                    console.log(error.response.data.message);
                    if(error.response.data.message == "Password not match"){
                        toast.error("Password does not match!");
                    }
                }
            )
        }
    }
    const [loading, setLoading] = useState(true);
    if (loading) return <Loader />;
    return(
        <div className="container">
            <ToastContainer />
            <h2>Edit Profile</h2>
            <br />
            {user
            .filter(user => user.Name == getUsername)
            .map(user => (
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-sm-6">
                        <input type="hidden" value={user.Id} name="getid"/>
                            <input type="text" placeholder="Enter Name" className="form-control" value={user.Name} name="name" required readOnly/>
                        </div>
                        <div className="col-sm-6">
                            <input type="email" placeholder="Enter Email Here" className="form-control" defaultValue={user.Email} name="email" required/>
                        </div>
                    </div>
                    <br />
                    <div className="row">
                        <div className="col-sm-6">
                            <input type="hidden" value={user.Password} name="getpassword"/>
                            <input type="password" placeholder="Enter Previous Password" className="form-control" name="previous_pass"/>
                        </div>
                        <div className="col-sm-6">
                            <input type="password" placeholder="Enter New Password" className="form-control" name="new_pass"/>
                        </div>
                    </div>
                    <br />
                    <div className="row">
                        <div className="col-sm-6">
                            <button className="btn btn-primary">Update Profile</button>
                        </div>
                    </div>
                </form>
            ))}
        </div>
    )
}