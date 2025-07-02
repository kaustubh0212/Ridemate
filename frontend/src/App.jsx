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
import YourRides from "./pages/yourRides";
import SearchRide from "./pages/SearchRide"
import DropRideDetails from "./pages/DropRideDetails"
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
        <Route path="/your-rides" element={<YourRides />} />
        <Route path="/dropRide-details/:rideId" element={<DropRideDetails />} />
        <Route path="/find-ride" element={<SearchRide />} />
      </Routes>
      <ToastContainer position="top-center" />
    </>
  );
};

export default App;
