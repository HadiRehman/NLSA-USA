import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY;

export default function DeleteUser(){
    const {id} = useParams();
    const [users, setUser] = useState([]);
    const navigate = useNavigate();
    const API_URL = BASE_URL+"/getusers";

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
                console.log("There was an error", error);
            }
        )
    }, [])

    const deleteUser = () => {
        const DELETE_URL = BASE_URL+`/deleteuser/${id}`;
        axios.delete(DELETE_URL, {
            headers: {
                "Authorization": apiKey,
                "Content-Type": "application/json"
            }
        })
        .then(
            res => {
                navigate("/users");
                // console.log(res);
            }
        )
        .catch(
            error => {
                console.log("There was an error", error);
            }
        )
    }
    const [loading, setLoading] = useState(true);
    if (loading) return <Loader />;
    return(
        <div className="container">
            <br /><br />
            {users.filter(user => user.Id == id)
            .map(user => (
                <h2>Are you sure you want to delete <i>"{user.Name}"</i> ?</h2>
            ))}
            <br />
            <button className="btn btn-danger" onClick={deleteUser}>Yes Delete</button>
        </div>
    )
}