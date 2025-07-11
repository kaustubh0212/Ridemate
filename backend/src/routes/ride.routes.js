import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middleware.js'
import{ dropRide, getAllDroppedRides, getAllDroppedRidesById, requestRide, getAllSearchedRidesById, moveOutOfRide, completeRideDetails, acceptRequest, cancelRide } from '../controllers/ride.controller.js'


const router = Router()


//router.route("/login").post(loginUser)

// secured routes

router.route("/drop-ride").post(verifyJWT, dropRide)
//router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/dropped-rides").get(verifyJWT, getAllDroppedRidesById)
router.route("/searched-rides").get(verifyJWT, getAllSearchedRidesById)
router.route("/searchRides").get(verifyJWT, getAllDroppedRides)
router.route("/requestRide/:rideId").post(verifyJWT, requestRide)
router.route("/move-out/:rideId").post(verifyJWT, moveOutOfRide)
router.route("/ride-detail/:rideId").get(verifyJWT, completeRideDetails)
router.route("/accept-request/:rideId/:userId").post(verifyJWT, acceptRequest)
router.route("/cancel-ride/:rideId").patch(verifyJWT, cancelRide)

export default router