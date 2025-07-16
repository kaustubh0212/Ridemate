import connectDB from "./db/db.js";
import { app, io, server } from "./app.js";
import { ChatMessage } from "./models/chatMessage.model.js";
import { GroupChat } from "./models/groupChat.model.js";
import mongoose from "mongoose";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import socketAuth from '../src/middlewares/socketAuth.middleware.js'

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });

/*
app.get("/", (req, res) => {
  res.send("Backend is working!");
});
*/

// middleware
io.use(socketAuth) // socketAuth.middleware.js

io.on("connection", async (socket) => {
  console.log("A user connected: ", socket.id);

  socket.on("joinRoom", ({ rideId }) => {
    socket.join(rideId);
  });

  socket.on("sendMessage", async ({ rideId, message}) => {

    const sender = socket.user._id

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if user is part of the group chat
      const groupChat = await GroupChat.findOne({ rideId }).session(session);
      if (!groupChat) {
        throw new ApiError(404, "Group chat not found");
      }

      const isParticipant = groupChat.participants.includes(sender);
      if (!isParticipant) {
        throw new ApiError(
          403,
          "User not authorized to send messages in this group"
        );
      }

      // Save message
      const newMessage = await ChatMessage.create(
        [{ rideId, message, sender }],
        { session }
      );
      const fullMessage = await ChatMessage.findById(newMessage[0]._id)
        .populate("sender", "name avatar")
        .session(session);

      // Commit and emit
      await session.commitTransaction();
      io.to(rideId).emit("receiveMessage", fullMessage);
    } catch (err) {
      await session.abortTransaction();
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(500, "Internal server error");
      socket.emit(
        "errorMessage",
        new ApiResponse(false, apiError.statusCode, apiError.message)
      );
    } finally {
      session.endSession();
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
