import React from "react";
import logo from "../../images/logo.png";
import "./Header.css";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand d-flex align-items-center" href="/">
          <img
            src={logo}
            alt="Logo"
            height="65"
            className="d-inline-block align-top me-2"
          />
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          style={{ marginLeft: "30%", height: "60px" }}
          className="collapse navbar-collapse"
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a
                className="nav-link"
                href="https://www.facebook.com/NLSAUSA/"
                target="_blank"
                rel="noreferrer"
              >
                <i
                  className="bi bi-facebook fs-5 text-primary"
                  style={{ width: "60px" }}
                ></i>
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="https://twitter.com/NationalLocalS1"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-x fs-5 text-info"></i>
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="https://www.instagram.com/nlsausa/"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-instagram fs-5 text-danger"></i>
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="https://www.linkedin.com/in/william-sims-3951b0198/"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-linkedin fs-5 text-primary"></i>
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="https://www.youtube.com/channel/UCFQDlMwWxp5ye818xX8kzIw"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-youtube fs-5 text-danger"></i>
              </a>
            </li>

            <p style={{ marginLeft: "50px", marginTop: "10px" }}>
              info@nlsausa.com | (833)-657-2872
            </p>
          </ul>
          {/* Contact button */}
          <Link to="https://nlsausa.com/contact/">
            <button className="btn btn-outline-primary" type="button">
              Contact
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
