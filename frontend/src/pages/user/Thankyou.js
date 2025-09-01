
import Header from "../../components/user/Header";
import images from "../../images/images.jpeg";
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Thankyou() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
   
    if (!location.state?.fromForm) {
      navigate("/", { replace: true }); 
    }
  }, [location, navigate]);

  return (
    <div>
      <Header />
      <div
        className="container-fluid d-flex justify-content-center align-items-center"
        style={{
          background: "linear-gradient(to right, #e0f2ff, #ffffff)",
          height: "100vh",
        }}
      >
        <div
          className="card shadow"
          style={{
            width: "30rem",
            height: "20rem",
            borderRadius: "10px",
          }}
        >
          <div className="card-body text-center">
            <img
              style={{ marginBottom: "15px" }}
              src={images}
              alt="images"
              height="100"
              className="d-inline-block align-top me-2"
            />
            <h3 className="card-title mb-3">THANK YOU!</h3>
            <h6 className="card-subtitle mb-2 text-muted">
              Your stats are now under review for approval
            </h6>
            <p className="card-text">
              You will be notified on your email address
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
