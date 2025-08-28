import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const apiKey = process.env.REACT_APP_API_KEY;

export default function DeleteUser() {
  const { id } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const API_URL = BASE_URL + "/getusers";

  useEffect(() => {
    axios
      .get(API_URL, {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
        setShowModal(true); // ✅ open modal after data loads
      })
      .catch((error) => {
        console.log("There was an error", error);
      });
  }, [API_URL]);

  const deleteUser = () => {
    const DELETE_URL = BASE_URL + `/deleteuser/${id}`;
    axios
      .delete(DELETE_URL, {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        setShowModal(false);
        navigate("/users");
      })
      .catch((error) => {
        console.log("There was an error", error);
      });
  };

  if (loading) return <Loader />;

  const user = users.find((u) => u.Id == id);

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    navigate("/users");
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {user ? (
                  <p>
                    Are you sure you want to delete <b>{user.Name}</b> ?
                  </p>
                ) : (
                  <p>User not found</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    navigate("/users");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={deleteUser}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
