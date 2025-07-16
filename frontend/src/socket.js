import { io } from "socket.io-client";

const socket = io( import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  // Will send cookies to backend
});

export default socket