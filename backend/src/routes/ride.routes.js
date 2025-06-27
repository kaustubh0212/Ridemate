import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middleware.js'
import{ dropRide, getAllDroppedRides, getAllDroppedRidesById, requestRide } from '../controllers/ride.controller.js'


const router = Router()


//router.route("/login").post(loginUser)

// secured routes

router.route("/drop-ride").post(verifyJWT, dropRide)
//router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/dropped-rides").get(verifyJWT, getAllDroppedRidesById)
router.route("/searchRides").get(verifyJWT, getAllDroppedRides)
router.route("/requestRide/:rideId").post(verifyJWT, requestRide)
export default router