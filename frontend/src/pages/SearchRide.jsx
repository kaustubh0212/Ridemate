// src/pages/SearchRide.jsx
import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Paper,
  Container,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const libraries = ['places'];

const SearchRide = () => {
  const pickupRef = useRef();
  const dropRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [rides, setRides] = useState([]);
  const [requestedRides, setRequestedRides] = useState([]);

  const isLoggedIn = useSelector((state) => state.auth.isLogin);

  const { isLoaded } = window.google?.maps
    ? { isLoaded: true }
    : { isLoaded: false };

  useEffect(() => {
    if (isLoaded) {
      [
        [pickupRef, setPickup],
        [dropRef, setDrop],
      ].forEach(([ref, set]) => {
        const auto = new window.google.maps.places.Autocomplete(ref.current);
        auto.addListener('place_changed', () => {
          const place = auto.getPlace();
          if (place.geometry?.location) {
            set({
              name: place.formatted_address,
              coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
            });
          }
        });
      });
    }
  }, [isLoaded]);

  const handleSearch = async () => {
    if (!pickup || !drop) return toast.error('Both locations required');
    if (!isLoggedIn) return navigate('/login');

    try {
      const { data } = await axios.get('/api/v1/rides/searchRides', {
        params: {
          pickupName: pickup.name,
          dropName: drop.name,
          pickupLat: pickup.coordinates.lat,
          pickupLng: pickup.coordinates.lng,
          dropLat: drop.coordinates.lat,
          dropLng: drop.coordinates.lng,
        },
        withCredentials: true,
      });

      console.log('Response from backend:', data);

      const filtered = data.data.filter(
        (r) => r.seatsLeft > 0 && r.status === 'pending'
      );

      setRides(filtered);
    } catch (err) {
      console.error(err);
      toast.error('Search failed');
    }
  };

const handleRequest = async (rideId) => {
  if (!isLoggedIn) return navigate('/login');
  
  try {
    const { data } = await axios.post(
      `/api/v1/rides/requestRide/${rideId}`,
      {}, // no body needed
      { withCredentials: true }
    );
    
    setRequestedRides((prev) => [...prev, rideId]);
    toast.success(data.message || 'Request sent!');

  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Request failed');
  }
};


  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9f9f9', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom align="center">
          Search for Available Rides
        </Typography>

        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 4 }}>
          <TextField inputRef={pickupRef} label="Pickup Location" fullWidth autoComplete="off" />
          <TextField inputRef={dropRef} label="Drop Location" fullWidth autoComplete="off" />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ backgroundColor: '#000', color: '#fff', minWidth: 140 }}
          >
            Search
          </Button>
        </Stack>

        <Box>
          <Typography variant="h6" gutterBottom>
            Available Rides:
          </Typography>
          {rides.length === 0 ? (
            <Typography>No rides found.</Typography>
          ) : (
            rides.map((ride, idx) => (
              <Paper
                key={ride._id}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: idx % 2 === 0 ? '#ededed' : '#ffffff',
                }}
              >
                <Typography>
                  <strong>Date:</strong> {ride.departureDate} at {ride.departureTime}
                </Typography>
                <Typography><strong>Car:</strong> {ride.carDetails || 'N/A'}</Typography>
                <Typography><strong>Seats Left:</strong> {ride.seatsLeft}</Typography>
                <Button
                  onClick = {() => handleRequest(ride._id)}
                  variant="outlined"
                  sx={{ mt: 1 }}
                  disabled={requestedRides.includes(ride._id)}
                >
                  {requestedRides.includes(ride._id) ? 'Requested' : 'Request'}
                </Button>
              </Paper>
            ))
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default SearchRide;
