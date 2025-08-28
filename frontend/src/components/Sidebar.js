import React, { useState } from "react";
import App from "../App";
import Cookies from "js-cookie";
import { BrowserRouter, Link, useNavigate } from "react-router-dom";
import Login from "../pages/Login";
import axios from "axios";
import logo from "../images/logo.png"
const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY;


export default function Sidebar(){
    const getUsername = Cookies.get("username");
    const getRole = Cookies.get("user_role");
    const navigate = useNavigate();
    const LOGOUT_URL = BASE_URL+"/logout";
    const logout = () => {
        axios.post(LOGOUT_URL, [],{
            headers:{
                "Authorization": apiKey,
                "Content-Type": "application/json"
            }
        }).
        then(
            res => {
                Cookies.remove("username");
                navigate("/");
            }
            
        )
        .catch(
            error => {
                console.error(error);
            }
        )
    }
    return(
        <div>            
            {getUsername ?( 
            <div class="container-fluid">
                <div class="row flex-nowrap">
                    
                    <div class="col-auto col-md-3 col-xl-2 px-sm-2 px-0">
                        <div class="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-dark min-vh-100">
                            <Link to="/" class="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
                                <img src={logo} width="120"/>
                            </Link>
                            <ul class="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
                                <li class="nav-item">
                                    <Link to="/" class="nav-link align-middle px-0 text-dark">
                                        <i class="fs-4 bi-house"></i> <span class="ms-1 d-none d-sm-inline">Home</span>
                                    </Link>
                                </li>
                                {getRole == "Administrator" &&
                                    <>
                                        <li>
                                            <Link to="players" class="nav-link px-0 align-middle text-dark">
                                                <i class="bi bi-person-lines-fill"></i> <span class="ms-1 d-none d-sm-inline">Players</span></Link>
                                        </li>

                                        <li>
                                            <Link to="certificates" class="nav-link px-0 align-middle text-dark">
                                                <i class="bi bi-card-heading"></i> <span class="ms-1 d-none d-sm-inline">Certificates</span></Link>
                                        </li>
                                    
                                        <li>
                                            <Link to="sports" class="nav-link px-0 align-middle text-dark">
                                                <i class="bi bi-clipboard-data"></i> <span class="ms-1 d-none d-sm-inline">Sports</span></Link>
                                        </li>

                                        <li>
                                            <Link to="/users" class="nav-link px-0 align-middle text-dark">
                                                <i class="fs-4 bi-people"></i> <span class="ms-1 d-none d-sm-inline">Users</span> </Link>
                                        </li>
                                    </>
                                }    
                            </ul>
                            <hr />
                            <div class="dropdown pb-4">
                                <a href="#" class="d-flex align-items-center text-dark text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvts5aHBstDkR8PigS4RmZkbZy78zpZoSuOw&s" alt="hugenerd" width="30" height="30" class="rounded-circle" />
                                    <span class="d-none d-sm-inline mx-1">{getUsername}</span>
                                </a>
                                <ul class="dropdown-menu dropdown-menu-dark text-small shadow">
                                    <li><Link to="updateprofile" class="dropdown-item">Profile</Link></li>
                                    <li>
                                        <hr class="dropdown-divider" />
                                    </li>
                                    <li><Link class="dropdown-item" to="/" onClick={logout}>Sign out</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col py-3">
                        <App />
                    </div>
                </div>
            </div>    
            ):
            (
                <App />
            )
            }
        </div>
    )
}