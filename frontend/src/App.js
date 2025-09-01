import React from "react";
import {BrowserRouter, Routes, Route, useNavigate} from 'react-router-dom';
import AdminDashboard from "./pages/AdminDashboard";
import Cookies from "js-cookie";
import Login from "./pages/Login";
import UpdateProfile from "./pages/UpdateProfile";
import ShowUsers from "./pages/ShowUsers";
import AddUser from "./pages/AddUser";
import DeleteUser from "./pages/DeleteUser";
import ShowPlayers from "./pages/ShowPlayers";
import ShowStats from "./pages/ShowStats";
import DeletePlayer from "./pages/DeletePlayer";
import Home from "./pages/user/Home";
import Thankyou from "./pages/user/Thankyou";

function App() {
  const getUsername = Cookies.get("username");
  const getRole = Cookies.get("user_role");
  const navigate = useNavigate();

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
              <Route path="/players" element={<ShowPlayers />}></Route>
              <Route path="/stats/:id" element={<ShowStats />}></Route>
              <Route path="/deleteplayer/:id" element={<DeletePlayer />}></Route>
            </>
          }
        </Routes>
      ):(
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Thankyou" element={<Thankyou />} />    
          <Route path="/admin" element={<Login />}></Route>
        </Routes>
      )
      }
    </div>
  );
}

export default App;
