import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
//import jwt from "jsonwebtoken";
import Ride from "../models/ride.model.js";
import User from "../models/user.model.js"
import { GroupChat } from '../models/groupChat.model.js';
//import { getCurrentUser } from '../controllers/user.controller.js'
import mongoose from 'mongoose';
import { getDistance } from 'geolib';


const getAllDroppedRidesById = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const rides = await Ride.find({ admin: userId}).sort({created: -1})
    
    if (!rides) {
      return res.status(404).send({
        success: false,
        message: "Rides could not be fetched",
      });
    }

    res.status(200).json({
    success: true,
    message: "Dropped rides fetched successfully",
    count: rides.length,
    rides,
  });
})

/*
const moveOutOfRide = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const rideId = req.params.rideId;

  const ride = await Ride.findById(rideId);
  if (!ride) {
    return res.status(404).json({ success: false, message: 'Ride not found' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const isRequested = ride.requestedUser.includes(userId);
  const isJoined = ride.joinedUser.includes(userId);

  console.log(
    "isRequested: ", isRequested, "\n isJoined: ", isJoined
  )

  // Case 1: Only requested
  if (isRequested && !isJoined) {
    // Remove from user.requestRide
    user.requestedRide = user.requestedRide.filter(id => id.toString() !== rideId.toString());

    // Remove from ride.requestedUser
    ride.requestedUser = ride.requestedUser.filter(id => id.toString() !== userId.toString());
  }

  // Case 2: Joined (confirmed)
  if (!isRequested && isJoined) {
    // Remove from user.searchRide
    user.searchRides = user.searchRides.filter(id => id.toString() !== rideId.toString());

    // Remove from ride.joinedUser
    ride.joinedUser = ride.joinedUser.filter(id => id.toString() !== userId.toString());

    // Increase seat count
    ride.seatsLeft += 1;
  }

  await user.save();
  await ride.save();

  return res.status(200).json({ success: true, message: 'Moved out successfully' });
});
*/

const moveOutOfRide = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const rideId = req.params.rideId;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ride = await Ride.findById(rideId).session(session);
    if (!ride) throw new Error('Ride not found');

    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');

    const isRequested = ride.requestedUser.includes(userId);
    const isJoined = ride.joinedUser.includes(userId);

    if (!isRequested && !isJoined) {
      throw new Error('User is neither a requester nor a participant of the ride');
    }

    // Case 1: Requested but not joined
    if (isRequested && !isJoined) {
      user.requestedRide = user.requestedRide.filter(
        (id) => id.toString() !== rideId.toString()
      );
      ride.requestedUser = ride.requestedUser.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

// Case 2: Joined (confirmed participant)
if (isJoined && !isRequested) {
  user.searchRides = user.searchRides.filter(
    (id) => id.toString() !== rideId.toString()
  );
  ride.joinedUser = ride.joinedUser.filter(
    (id) => id.toString() !== userId.toString()
  );
  
  ride.seatsLeft += 1;

  // Remove user from GroupChat participants
  await GroupChat.updateOne(
    { rideId },
    { $pull: { participants: userId } },
    { session }
  );

  // Send system message to chat
  await ChatMessage.create(
    [{
      rideId,
      sender: userId, // can be a special system user if needed
      message: `${user.name} has left the ride.`,
    }],
    { session }
  );
}

    await user.save({ session });
    await ride.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: 'Moved out successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to move out of ride',
    });
  }
});



const getAllSearchedRidesById = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const rides = await Ride.find({
    $or: [
      { requestedUser: userId },
      { joinedUser: userId },
    ],
    // ✅ Include cancelled rides – no status filter
  })
    .populate('admin', 'name email avatar')
    .sort({ departureDate: 1, departureTime: 1 });

  // ✅ Add requestStatus to each ride
  const formattedRides = rides.map((ride) => {
    let requestStatus = '';
    if (ride.joinedUser.includes(userId)) {
      requestStatus = 'Confirmed';
    } else if (ride.requestedUser.includes(userId)) {
      requestStatus = 'Pending';
    }

    return {
      ...ride.toObject(),
      requestStatus,
    };
  });

  return res.status(200).json({ success: true, rides: formattedRides });
});


const getAllDroppedRides = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const {
    pickupName,
    dropName,
    pickupLat,
    pickupLng,
    dropLat,
    dropLng,
  } = req.query;

  if (
    !pickupName || !dropName ||
    pickupLat === undefined || pickupLng === undefined ||
    dropLat === undefined || dropLng === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required pickup/drop data",
    });
  }

  const pickupCoords = [parseFloat(pickupLng), parseFloat(pickupLat)];
  const dropCoords = [parseFloat(dropLng), parseFloat(dropLat)];
  const dropTextPart = dropName.split(',')[0].trim();

  // STEP 1: Query rides based on pickup location only
const initialRides = await Ride.find({
  admin: { $ne: userId },
  joinedUser: { $nin: [userId] },
  requestedUser: { $nin: [userId] },
  seatsLeft: { $gt: 0 },
  status: 'pending', // ✅ Only active rides
  'pickupLocation.coordinates': {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: pickupCoords,
      },
      $maxDistance: 3000,
    },
  },
});

  // STEP 2: Filter by drop location (either coordinates or name)
  const MAX_DROP_DISTANCE = 3000; // 10 km
  const filteredRides = initialRides.filter((ride) => {
    const rideDrop = ride.dropLocation;

    const isDropNear =
      getDistance(
        { latitude: dropLat, longitude: dropLng },
        { latitude: rideDrop.coordinates[1], longitude: rideDrop.coordinates[0] }
      ) <= MAX_DROP_DISTANCE;

    const isNameMatch = rideDrop.name.toLowerCase().includes(dropTextPart.toLowerCase());

    return isDropNear || isNameMatch;
  });

  console.log(`Rides matched: ${filteredRides.length}`);

  return res.status(200).json(
    new ApiResponse(200, filteredRides, "Matching rides fetched successfully")
  );
});

/*
const dropRide = asyncHandler(async (req, res) => {
  const {
    pickupLocation,
    dropLocation,
    departureDate,
    departureTime,
    totalSeats,
    seatsLeft,
    amountToPay,
    carDetails,
  } = req.body;

  console.log("req.body drop ride data: ", req.body);

  if (
    !pickupLocation?.name ||
    pickupLocation?.coordinates?.lat === undefined ||
    pickupLocation?.coordinates?.lng === undefined ||
    !dropLocation?.name ||
    dropLocation?.coordinates?.lat === undefined ||
    dropLocation?.coordinates?.lng === undefined ||
    !departureDate ||
    !departureTime ||
    !totalSeats ||
    seatsLeft === undefined ||
    amountToPay === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all required fields',
    });
  }

  const user = req.user;
  if (!user || !user._id) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. User data not found.',
    });
  }

  let ride = null;

  try {
    // Step 1: Create Ride
    ride = await Ride.create({
      user: user._id,
      admin: user._id,
      joinedUser: [],
      requestedUser: [],
      pickupLocation: {
        type: 'Point',
        name: pickupLocation.name,
        coordinates: [pickupLocation.coordinates.lng, pickupLocation.coordinates.lat],
      },
      dropLocation: {
        type: 'Point',
        name: dropLocation.name,
        coordinates: [dropLocation.coordinates.lng, dropLocation.coordinates.lat],
      },
      departureDate,
      departureTime,
      totalSeats,
      seatsLeft,
      amountToPay,
      carDetails: carDetails?.trim() || '',
      status: 'pending',
    });

    // Step 2: Update user's dropRide array
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $push: { dropRide: ride._id } },
      { new: true }
    );

    if (!updatedUser) {
      // User update failed → rollback ride creation
      await Ride.findByIdAndDelete(ride._id);
      return res.status(500).json({
        success: false,
        message: "Ride created but failed to update user. Ride has been deleted.",
      });
    }

    return res.status(201).json(
      new ApiResponse(201, ride, "Ride dropped and user updated successfully")
    );

  } catch (error) {
    console.error("Error in dropRide controller:", error);

    // Ride created but error occurred later (e.g., in user update)
    if (ride && ride._id) {
      await Ride.findByIdAndDelete(ride._id);
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the ride.",
    });
  }
});
*/

const dropRide = asyncHandler(async (req, res) => {
  const {
    pickupLocation,
    dropLocation,
    departureDate,
    departureTime,
    totalSeats,
    seatsLeft,
    amountToPay,
    carDetails,
  } = req.body;

  if (
    !pickupLocation?.name ||
    pickupLocation?.coordinates?.lat === undefined ||
    pickupLocation?.coordinates?.lng === undefined ||
    !dropLocation?.name ||
    dropLocation?.coordinates?.lat === undefined ||
    dropLocation?.coordinates?.lng === undefined ||
    !departureDate ||
    !departureTime ||
    !totalSeats ||
    seatsLeft === undefined ||
    amountToPay === undefined
  ) {
    throw new ApiError(400, 'Please fill all required fields');
  }

  const user = req.user;
  if (!user || !user._id) {
    throw new ApiError(401, 'Unauthorized. User data not found.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Create Ride
    const ride = await Ride.create([{
      user: user._id,
      admin: user._id,
      joinedUser: [],
      requestedUser: [],
      pickupLocation: {
        type: 'Point',
        name: pickupLocation.name,
        coordinates: [pickupLocation.coordinates.lng, pickupLocation.coordinates.lat],
      },
      dropLocation: {
        type: 'Point',
        name: dropLocation.name,
        coordinates: [dropLocation.coordinates.lng, dropLocation.coordinates.lat],
      },
      departureDate,
      departureTime,
      totalSeats,
      seatsLeft,
      amountToPay,
      carDetails: carDetails?.trim() || '',
      status: 'pending',
    }], { session });

    const createdRide = ride[0]; // since Ride.create returns an array in this syntax

    // Step 2: Update user dropRide array
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $push: { dropRide: createdRide._id } },
      { new: true, session }
    );

    if (!updatedUser) {
      throw new ApiError(500, 'Ride created but user update failed');
    }

    // Step 3: Create GroupChat for ride
    const groupChat = await GroupChat.create([{
      rideId: createdRide._id,
      participants: [user._id],
    }], { session });

    if (!groupChat || !groupChat[0]) {
      throw new ApiError(500, 'Ride created but group chat creation failed');
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(
      new ApiResponse(201, createdRide, "Ride dropped and group chat created successfully")
    );

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Transaction failed in dropRide:", error);
    throw new ApiError(500, "Failed to drop ride. All changes reverted.");
  }
});



const requestRide = asyncHandler(async (req, res) => {
  const rideId = req.params.rideId;
  const userId = req.user._id;

  const ride = await Ride.findById(rideId);
  if (!ride) {
    return res.status(404).json({ success: false, message: 'Ride not found' });
  }

  if (ride.requestedUser.includes(userId) || ride.joinedUser.includes(userId)) {
    return res.status(400).json({ success: false, message: 'Already requested or joined' });
  }

  ride.requestedUser.push(userId);
  //const k = ride.seatsLeft - 1;
  //ride.seatsLeft = k;
  await ride.save();

  const user = await User.findById(userId);
  user.requestedRide.push(rideId);
  await user.save();

  return res.status(200).json({ success: true, message: 'Request sent' });
});

const completeRideDetails = asyncHandler(async (req, res) => {
  const rideId = req.params.rideId;
  const userId = req.user._id;

  // Validate rideId format
  if (!mongoose.Types.ObjectId.isValid(rideId)) {
    throw new ApiError(400, "Invalid ride ID");
  }

  const ride = await Ride.findById(rideId)
    .populate('admin', 'name email avatar')
    .populate('joinedUser', 'name email avatar')
    .populate('requestedUser', 'name email avatar');

  if (!ride) {
    throw new ApiError(404, "Ride not found");
  }

  // Ensure only the ride creator (admin) can view full ride details
  if (ride.admin._id.toString() !== userId.toString()) {
    throw new ApiError(403, "Access denied. Only ride owner can view details.");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      rideDetails: {
        _id: ride._id,
        pickupLocation: ride.pickupLocation,
        dropLocation: ride.dropLocation,
        departureDate: ride.departureDate,
        departureTime: ride.departureTime,
        totalSeats: ride.totalSeats,
        seatsLeft: ride.seatsLeft,
        amountToPay: ride.amountToPay,
        status: ride.status,
        carDetails: ride.carDetails,
        admin: ride.admin,
      },
      joinedUsers: ride.joinedUser || [],
      requestedUsers: ride.requestedUser || [],
    }, "Ride details fetched successfully")
  );
});

/*
const acceptRequest = asyncHandler(async (req, res) => {
  const rideId = req.params.rideId;
  const userIdToAccept = req.params.userId;

  // Validate rideId and userId
  if (!mongoose.Types.ObjectId.isValid(rideId) || !mongoose.Types.ObjectId.isValid(userIdToAccept)) {
    throw new ApiError(400, 'Invalid ride ID or user ID');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ride = await Ride.findById(rideId).session(session);
    const user = await User.findById(userIdToAccept).session(session);

    if (!ride || !user) {
      throw new ApiError(404, 'Ride or user not found');
    }

    if (ride.status === 'cancelled') {
      throw new ApiError(400, 'Cannot join a cancelled ride');
    }

    if (!ride.requestedUser.includes(userIdToAccept)) {
      throw new ApiError(400, 'User has not requested to join this ride');
    }

    if (ride.joinedUser.includes(userIdToAccept)) {
      throw new ApiError(400, 'User already joined the ride');
    }

    if (ride.seatsLeft <= 0) {
      throw new ApiError(400, 'No seats left');
    }

    // Update Ride model
    ride.requestedUser = ride.requestedUser.filter(
      (id) => id.toString() !== userIdToAccept.toString()
    );
    ride.joinedUser.push(userIdToAccept);
    ride.seatsLeft -= 1;
    await ride.save({ session });

    // Update User model
    user.requestedRide = user.requestedRide.filter(
      (id) => id.toString() !== rideId.toString()
    );
    user.searchRides.push(rideId);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json(new ApiResponse(200, null, 'User successfully added to ride'));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Transaction failed:', error);
    throw new ApiError(500, 'Failed to accept request. All changes reverted.');
  }
});
*/

const acceptRequest = asyncHandler(async (req, res) => {
  const rideId = req.params.rideId;
  const userIdToAccept = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(rideId) || !mongoose.Types.ObjectId.isValid(userIdToAccept)) {
    throw new ApiError(400, 'Invalid ride ID or user ID');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ride = await Ride.findById(rideId).session(session);
    const user = await User.findById(userIdToAccept).session(session);

    if (!ride || !user) throw new ApiError(404, 'Ride or user not found');
    if (ride.status === 'cancelled') throw new ApiError(400, 'Cannot join a cancelled ride');
    if (!ride.requestedUser.includes(userIdToAccept)) throw new ApiError(400, 'User has not requested to join this ride');
    if (ride.joinedUser.includes(userIdToAccept)) throw new ApiError(400, 'User already joined the ride');
    if (ride.seatsLeft <= 0) throw new ApiError(400, 'No seats left');

    // Update Ride model
    ride.requestedUser = ride.requestedUser.filter(id => id.toString() !== userIdToAccept.toString());
    ride.joinedUser.push(userIdToAccept);
    ride.seatsLeft -= 1;
    await ride.save({ session });

    // Update User model
    user.requestedRide = user.requestedRide.filter(id => id.toString() !== rideId.toString());
    user.searchRides.push(rideId);
    await user.save({ session });

    // ✅ Add user to GroupChat participants
    await GroupChat.updateOne(
      { rideId },
      { $addToSet: { participants: userIdToAccept } },
      { session }
    );

    // Send system message to chat
  await ChatMessage.create(
    [{
      rideId,
      sender: userIdToAccept, // can be a special system user if needed
      message: `${user.name} has left the ride.`,
    }],
    { session }
  );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(new ApiResponse(200, null, 'User successfully added to ride and chat group'));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Transaction failed:', error);
    throw new ApiError(500, 'Failed to accept request. All changes reverted.');
  }
});



const cancelRide = asyncHandler(async (req, res) => {
  const rideId = req.params.rideId;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(rideId)) {
    return res.status(400).json({ success: false, message: "Invalid ride ID" });
  }

  const ride = await Ride.findById(rideId);
  if (!ride) {
    return res.status(404).json({ success: false, message: "Ride not found" });
  }

  // Ensure only the ride admin can cancel it
  if (ride.admin.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: "You are not authorized/admin to cancel this ride" });
  }

  // If already cancelled
  if (ride.status === 'cancelled') {
    return res.status(400).json({ success: false, message: "Ride is already cancelled" });
  }

  ride.status = 'cancelled';
  await ride.save();

  return res.status(200).json({
    success: true,
    message: 'Ride cancelled successfully',
    ride,
  });
});



export {
  //getCurrentUser,
  dropRide,
  getAllDroppedRidesById,
  getAllSearchedRidesById,
  getAllDroppedRides,
  requestRide,
  moveOutOfRide,
  completeRideDetails,
  acceptRequest,
  cancelRide
};
