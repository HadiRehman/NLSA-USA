import React from "react";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import AdminDashboard from "./pages/AdminDashboard";
import Cookies from "js-cookie";
import Login from "./pages/Login";
import UpdateProfile from "./pages/UpdateProfile";
import ShowUsers from "./pages/ShowUsers";
import AddUser from "./pages/AddUser";
import DeleteUser from "./pages/DeleteUser";

function App() {
  const getUsername = Cookies.get("username");
  const getRole = Cookies.get("user_role");

  return (
    <div>
      {getUsername ?(
        <Routes>
          <Route path="/" element={<AdminDashboard />}></Route>
          <Route path="/updateprofile" element={<UpdateProfile />}></Route>
          {getRole === "Administrator" &&
            <>
              <Route path="/users" element={<ShowUsers />}></Route>
              <Route path="/adduser" element={<AddUser />}></Route>
              <Route path="/deleteuser/:id" element={<DeleteUser />}></Route>
            </>
          }
        </Routes>
      ):(
        <Login />
      )
      }
    </div>
  );
}

export default App;
