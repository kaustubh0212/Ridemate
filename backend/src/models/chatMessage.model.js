import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
