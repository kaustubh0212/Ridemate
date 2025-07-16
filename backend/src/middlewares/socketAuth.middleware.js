// src/middlewares/socketAuth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import cookie from "cookie";

const socketAuth = async (socket, next) => {
  try {
    const rawCookies = socket.handshake.headers.cookie || "";
    //console.log("rawCookies: ", rawCookies)
    const cookies = cookie.parse(rawCookies);
    const token = cookies.accessToken;

    if (!token) return next(new Error("Unauthorized: No token"));

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password");
    if (!user) return next(new Error("Unauthorized: Invalid user"));

    socket.user = user; // attach to socket
    next();
  } catch (err) {
    console.error("Auth Error in socketAuth middleware file:", err.message);
    next(new Error("Unauthorized: " + err.message)); // NEVER throw
  }
};
export default socketAuth