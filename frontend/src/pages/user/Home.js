import Header from "../../components/user/Header";
import React, { useState } from "react";   
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import baketball from "../../images/baketball.jpg"; 
import football from "../../images/football.jpg"; 
import hockey from "../../images/hockey.jpg"; 
import logo from "../../images/logo.png"; 
import axios from "axios";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";   
import { toast, ToastContainer } from "react-toastify";


const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY;

export default function Home() {
  const navigate = useNavigate();   
  const API_URL = BASE_URL + "/addplayer";  

  const [loading, setLoading] = useState(false); 

const handleSubmit = (e) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData(e.target);
  const sportCategory = formData.get("sportCategory");
  const playerName = formData.get("playerName");
  const eventName = formData.get("eventName");
  const dateOfBirth = formData.get("dateOfBirth");
  const cityLocation = formData.get("cityLocation");
  const email = formData.get("email");
  const jerseyNumber = formData.get("jerseyNumber");

  if (!sportCategory || !playerName || !eventName || !dateOfBirth || !cityLocation || !email || !jerseyNumber) {
    toast.error("All fields are required!");
    setLoading(false);
    return;
  }

  const data = {
    SportCategory: sportCategory,
    PlayerName: playerName,
    EventName: eventName,
    DateOfBirth: dateOfBirth,
    CityLocation: cityLocation,
    Email: email,
    JerseyNumber: jerseyNumber,
  };

axios
  .post(API_URL, data, {
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
  })
.then((res) => {
  toast.success("Player registered successfully!");
  sessionStorage.setItem("formSubmitted", "true");
  navigate("/Thankyou", { state: { fromForm: true } });
})

.catch((err) => {
    toast.error("Something went wrong!");
    console.error(err);
  })
  .finally(() => {
    setLoading(false);
  });
};


  if (loading) return <Loader />;

  return (
    <div>
      <Header />
      <ToastContainer />

      {/* Carousel */}
      <div
        id="carouselExample"
        className="carousel slide"
        data-bs-ride="carousel"
        style={{ marginBottom: "40px", margin: "30px" }}
      >
        <div className="carousel-inner">
          <div className="carousel-item active">
            <div style={{ position: "relative" }}>
              <img
                src={baketball}
                className="d-block w-100"
                alt="Slide 1"
                style={{ height: "600px", borderRadius: "30px", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderRadius: "30px",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  color: "white",
                }}
              >
                <h2 style={{ fontSize: "48px", marginBottom: "20px" }}>
                  Welcome to Baseball World
                </h2>
                <button
                  className="btn"
                  style={{
                    backgroundColor: "#007BFF",
                    color: "white",
                    padding: "12px 25px",
                    borderRadius: "8px",
                    fontSize: "18px",
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>

          <div className="carousel-item">
            <div style={{ position: "relative" }}>
              <img
                src={football}
                className="d-block w-100"
                alt="Slide 2"
                style={{ height: "600px", borderRadius: "30px", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderRadius: "30px",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  color: "white",
                }}
              >
                <h2 style={{ fontSize: "48px", marginBottom: "20px" }}>
                  Experience the Football Spirit
                </h2>
                <button
                  className="btn"
                  style={{
                    backgroundColor: "#007BFF",
                    color: "white",
                    padding: "12px 25px",
                    borderRadius: "8px",
                    fontSize: "18px",
                  }}
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>

          <div className="carousel-item">
            <div style={{ position: "relative" }}>
              <img
                src={hockey}
                className="d-block w-100"
                alt="Slide 3"
                style={{ height: "600px", borderRadius: "30px", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderRadius: "30px",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  color: "white",
                }}
              >
                <button
                  className="btn"
                  style={{
                    backgroundColor: "#007BFF",
                    color: "white",
                    padding: "12px 25px",
                    borderRadius: "8px",
                    fontSize: "18px",
                  }}
                >
                  Explore
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExample"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExample"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      {/* Player Form Section */}
      <div
        className="container-fluid"
        style={{
          background: "linear-gradient(to right, #e0f2ff, #ffffff)"
        }}
      >
        <h3 style={{ marginBottom: "20px", fontWeight: "bold", textAlign:"center" }}>
          Player Stat Entry Form
        </h3>
        <div className="row align-items-center justify-content-center">
          <div className="col-md-5 p-5">
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <img
                src={logo}
                alt="Logo"
                height="150px"
                className="d-inline-block align-top me-2"
              />     
            </div>

            {/* Player Form */}
            <form onSubmit={handleSubmit}>          
              <div className="mb-3">
                <small className="text">Sport</small>
                <select
                  className="form-control" name="sportCategory" required
                  style={{ borderRadius: "10px", padding: "12px 20px" }}
                >
                  <option value="">Select Sport</option>
                  <option value="baseball">Baseball</option>
                </select>
              </div>

              <div className="mb-3">
                 <small className="text">Player Name</small>
                <input type="text" className="form-control" name="playerName" required placeholder="Enter Player Name"
                  style={{ borderRadius: "10px", padding: "12px 20px" }} />
              </div>

              <div className="mb-3">
                <small className="text">Event Name</small>
                <input type="text" className="form-control" name="eventName" required placeholder="Enter Event Name"
                  style={{ borderRadius: "10px", padding: "12px 20px" }} />
              </div>

              <div className="mb-3">
                <small className="text">Jersey Number</small>
                <input type="text" className="form-control" name="jerseyNumber" required placeholder="Enter Jersey Number"
                  style={{ borderRadius: "10px", padding: "12px 20px" }} />
              </div>

              <div className="mb-3">
                <small className="text">Email</small>
                <input type="email" className="form-control" name="email" required placeholder="Enter Email"
                  style={{ borderRadius: "10px", padding: "12px 20px" }} />
              </div>

              <div className="mb-3">
                <small className="text">Date of Birth</small>
                <input type="date" className="form-control" name="dateOfBirth" required 
                  style={{ borderRadius: "10px", padding: "12px 20px" }} />
              </div>
              <div className="mb-3">
                <small className="text">Adress</small>
                <input type="text" className="form-control" name="cityLocation" required placeholder="Enter City / Location"
                  style={{ borderRadius: "10px", padding: "12px 20px" }} />
              </div>

              <div className="mb-3">
                <label>Upload Waiver (PDF/Photo)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="form-control"
                  style={{ borderRadius: "10px", padding: "12px 20px" }} />
              </div>

              <div className="mb-3">
                <label>Upload Optional Video Clip</label>
                <input type="file" accept="video/*" className="form-control"
                  style={{ borderRadius: "10px", padding: "12px 20px" }} />
              </div>

              <button type="submit" className="btn w-100"
                style={{
                  backgroundColor: "#007BFF",
                  borderRadius: "50px",
                  padding: "12px",
                  fontWeight: "bold",
                }}
              >
                Submit
              </button>
            </form>
          </div>

          <div className="col-md-6 text-center">
            <img
              src={football}
              alt="form illustration"
              style={{
                borderRadius: "20px",
                maxWidth: "100%",
                height: "680px",
                boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
                marginTop:"150px"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
