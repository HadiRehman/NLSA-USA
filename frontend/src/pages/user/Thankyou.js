import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import Header from "../../components/user/Header";
import images from "../../images/images.jpeg";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Thankyou() {
  const navigate = useNavigate();

  useEffect(() => {
    const submitted = sessionStorage.getItem("formSubmitted");
    if (!submitted) {
      navigate("/Thankyou"); 
    } else {
      sessionStorage.removeItem("formSubmitted");
    }
  }, [navigate]);

  return (
    <div>
      <Header />
      <div
        className="container-fluid"
        style={{
          background: "linear-gradient(to right, #e0f2ff, #ffffff)",
          padding: "50px 0",
          height: "568px",
        }}
      >
        <div
          className="card"
          style={{
            width: "30rem",
            height: "20rem",
            marginTop: "5%",
            marginLeft: "33%",
            borderRadius: "10px",
          }}
        >
          <div className="card-body">
            <img
              style={{ marginTop: "20px", marginLeft: "35%" }}
              src={images}
              alt="images"
              height="150"
              className="d-inline-block align-top me-2"
            />
            <h3
              style={{ textAlign: "center", marginBottom: "20px" }}
              className="card-title"
            >
              THANK YOU!
            </h3>
            <h6
              style={{ textAlign: "center" }}
              className="card-subtitle mb-2 text-muted"
            >
              Your stats are now under review for approval
            </h6>
            <p style={{ textAlign: "center" }} className="card-text">
              You will be notified on your email address
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
