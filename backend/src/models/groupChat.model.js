import mongoose from 'mongoose';

const groupChatSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true,
    unique: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
}, { timestamps: true });

export const GroupChat = mongoose.model('GroupChat', groupChatSchema);
