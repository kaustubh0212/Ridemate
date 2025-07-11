import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ChatMessage } from '../models/chatMessage.model.js';

const getChatMessages = asyncHandler(async (req, res) => {
  const { rideId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(rideId)) {
    throw new ApiError(400, 'Invalid ride ID');
  }

  // fetching the message
  const messages = await ChatMessage.find({ rideId })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 }); // oldest to newest

  return res
    .status(200)
    .json(new ApiResponse(200, messages, 'Chat messages fetched successfully'));
});


export {
    getChatMessages
}