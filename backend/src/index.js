import connectDB from './db/db.js'
import {app, io, server} from "./app.js"
import { ChatMessage } from './models/chatMessage.model.js';

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });


connectDB().then(() => {
    server.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

/*
app.get("/", (req, res) => {
  res.send("Backend is working!");
});
*/


io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', ({ rideId }) => {
    socket.join(rideId);
  });

  socket.on('sendMessage', async ({ rideId, message, sender }) => {

    const newMessage = await ChatMessage.create({ rideId, message, sender });

    const fullMessage = await newMessage.populate('sender', 'name avatar');
    io.to(rideId).emit('receiveMessage', fullMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});