import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    joinedUser: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    requestedUser: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
    },

    dropLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
    },

    departureDate: {
      type: String,
      required: true,
      trim: true,
    },

    departureTime: {
      type: String,
      required: true,
      trim: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: [1, 'Total seats must be at least 1'],
      max: [10, 'Total seats cannot exceed 10'],
    },

    seatsLeft: {
      type: Number,
      required: true,
      min: [0, 'Seats left cannot be negative'],
    },

    amountToPay: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },

    carDetails: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Car details too long'],
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// ✅ Create geospatial index on pickup location
rideSchema.index({ coordinates: '2dsphere' }); // optional but common

rideSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
rideSchema.index({ 'dropLocation.coordinates': '2dsphere' }); // optional for future use

const Ride = mongoose.model('Ride', rideSchema);
export default Ride;


/*
old schema
const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    pickupLocation: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },

    dropLocation: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },

    departureDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      trim: true,
    },

    departureTime: {
      type: String, // Format: HH:mm
      required: true,
      trim: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: [1, 'Total seats must be at least 1'],
      max: [10, 'Total seats cannot exceed 10'],
    },

    seatsLeft: {
      type: Number,
      required: true,
      min: [0, 'Seats left cannot be negative'],
    },

    amountToPay: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },

    carDetails: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Car details too long'],
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },

    joinedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);
*/