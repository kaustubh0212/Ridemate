// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Services from "./pages/Services";
import AboutUs from "./pages/AboutUs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DropRide from "./pages/DropRide";
import { ToastContainer } from "react-toastify";

const App = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/drop-ride"]; // add more paths if needed

  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={
          <>
            <Home />
            <Services />
            <AboutUs />
          </>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/drop-ride" element={<DropRide />} />
      </Routes>
      <ToastContainer position="top-center" />
    </>
  );
};

export default App;
