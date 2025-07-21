import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { Server } from "socket.io";
import { createServer } from "http";
const allowedOrigins = process.env.CORS_ORIGIN?.split(",");


const app = express()
const server = createServer(app);

// middlewares

/*
app.use(cors({
    origin: process.env.CORS_ORIGIN, 
    credentials: true
}))
*/

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

/*
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});
*/

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});



app.use(express.json({limit: "10mb"}))  // for APIs sending json data
app.use(express.urlencoded({extended: true, limit: "10mb"})) // for HTML forms sending form data
app.use(express.static("public"))
app.use(cookieParser())
//app.use(errorHandler);

// router imports
import userRouter from '../src/routes/user.routes.js'
import rideRouter from '../src/routes/ride.routes.js'
import chatRouter from '../src/routes/chats.routes.js'

// routers
app.use("/api/v1/users", userRouter)
app.use("/api/v1/rides", rideRouter)
app.use("/api/v1/chats", chatRouter)


export { app, io, server }