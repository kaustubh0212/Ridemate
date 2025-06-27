import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
//import jwt from "jsonwebtoken";
import Ride from "../models/ride.model.js";
import User from "../models/user.model.js"
//import { getCurrentUser } from '../controllers/user.controller.js'
import mongoose from 'mongoose';
import { getDistance } from 'geolib';

/*
const dropRide = asyncHandler(async (req, res) => {

    
    const rideData = {
        pickupLocation: {
          name: pickupRef.current.value,
          coordinates: { ...pickup },
        },
        dropLocation: {
          name: dropRef.current.value,
          coordinates: { ...drop },
        },
        departureDate,
        departureTime,
        totalSeats: Number(maxPeople),
        seatsLeft: Number(maxPeople),
        amountToPay: Number(amount),
        carDetails,
      };
    

    const { pickupLocation, dropLocation, departureDate, departureTime, totalSeats, seatsLeft, amountToPay, carDetails } = req.body;

    console.log("req.body drop ride data: ", req.body)

    if( !pickupLocation?.name || !pickupLocation?.coordinates?.lat || !pickupLocation?.coordinates?.lng || !dropLocation?.name || !dropLocation?.coordinates?.lat || !dropLocation?.coordinates?.lng || !departureDate || !departureTime || !totalSeats || seatsLeft === undefined ||  seatsLeft === null || amountToPay === undefined || amountToPay === null )
    {
        // !pickupLocation?.name includes undefined, null, or "" (empty string)
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

  const ride = await Ride.create({
    user: user._id,
    admin: user._id,
    joinedUser: [],   // Initially empty
    requestedUser: [], // Initially empty
    pickupLocation,
    dropLocation,
    departureDate,
    departureTime,
    totalSeats,
    seatsLeft,
    amountToPay,
    carDetails: carDetails?.trim() || '',
    status: 'pending',
  });

  const createdRide = await Ride.findById(ride._id)

  if (!createdRide) {
    throw new ApiError(500, "Something went wrong while creating the ride");
  }

  return res.status(201).json(
    new ApiResponse(200, createdRide, "Ride created successfully")
    // json body response
  );

});
*/

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
const getAllSearchedRidesById = asyncHandler(async (req, res) => {
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
*/

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

  const ride = await Ride.create({
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

  const createdRide = await Ride.findById(ride._id);

  if (!createdRide) {
    throw new ApiError(500, "Something went wrong while creating the ride");
  }

  return res.status(201).json(
    new ApiResponse(200, createdRide, "Ride created successfully")
  );
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




export {
  dropRide,
  //getCurrentUser,
  getAllDroppedRidesById,
  //getAllSearchedRides,
  getAllDroppedRides,
  requestRide
};
