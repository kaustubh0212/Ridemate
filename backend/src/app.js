import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()


// middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN, 
    credentials: true
}))
app.use(express.json({limit: "10mb"}))  // for APIs sending json data
app.use(express.urlencoded({extended: true, limit: "10mb"})) // for HTML forms sending form data
app.use(express.static("public"))
app.use(cookieParser())

// router imports
import userRouter from '../src/routes/user.routes.js'

// routers
app.use("/api/v1/users", userRouter)


export { app }