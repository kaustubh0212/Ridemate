import { Router } from "express";
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { getChatMessages } from '../controllers/chat.controller.js'

const router = Router()

router.get('/get-messages/:rideId', verifyJWT, getChatMessages);

export default router