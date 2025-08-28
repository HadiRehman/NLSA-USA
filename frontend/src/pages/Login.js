import React, { useState } from "react";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY;

export default function Login() {
  const API_URL = BASE_URL + "/login";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get("uname");
    const password = formData.get("pass");

    const data = { Username: username, Password: password };

    axios
      .post(API_URL, data, {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.data.message !== "") {
          setLoading(true);
          const userRole = res.data.role;

          let date = new Date();
          date.setTime(date.getTime() + 10 * 60 * 60 * 1000);
          Cookies.set("username", username, { expires: date });
          Cookies.set("user_role", userRole, { expires: date });

          navigate('/');
        } else {
          toast.error("Invalid username!");
        }
      })
      .catch((error) => {
        toast.error("Login Failed!");
        console.log(error);
      });
  };

  if (loading) return <Loader />;

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <ToastContainer />
      <div className="card shadow-lg p-4 rounded-4" style={{ width: "380px" }}>
        <h3 className="text-center mb-4 fw-bold text-dark">Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input
              type="text"
              className="form-control rounded-3"
              placeholder="Enter username"
              name="uname"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control rounded-3"
              placeholder="Enter password"
              name="pass"
              required
            />
          </div>
          <button className="btn btn-dark w-100 rounded-3 py-2 fw-semibold">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
