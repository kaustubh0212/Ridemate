// src/pages/DropRide.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, Stack, TextField, Typography, InputAdornment } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, useJsApiLoader, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';

const libraries = ['places'];
const containerStyle = { width: '100%', height: '100%' };

const DropRide = () => {
  const navigate = useNavigate();

  const { isLoggedIn, userData } = useSelector((state) => state.auth);


  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [directions, setDirections] = useState(null);
  const [boundsApplied, setBoundsApplied] = useState(false);

  const [maxPeople, setMaxPeople] = useState('');
  const [carDetails, setCarDetails] = useState('');
  const [amount, setAmount] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');

  const pickupRef = useRef();
  const dropRef = useRef();
  const mapLoaded = useRef(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

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
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
            setBoundsApplied(false);
          }
        });
      });
    }
  }, [isLoaded]);

  useEffect(() => {
    const pts = [];
    if (pickup) pts.push(pickup);
    if (drop) pts.push(drop);
    setMarkers(pts);
  }, [pickup, drop]);

  useEffect(() => {
    if (map && pickup && drop && !boundsApplied) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(pickup);
      bounds.extend(drop);
      map.fitBounds(bounds);
      setBoundsApplied(true);
    }
  }, [pickup, drop, map, boundsApplied]);

  const onMapLoad = (m) => {
    setMap(m);
    if (mapLoaded.current) return;
    mapLoaded.current = true;

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        m.setCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => m.setCenter({ lat: 22.9734, lng: 78.6569 })
    );
    m.setZoom(8);
  };

  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const handleSubmit = async () => {
    console.log("isloggedIn: ", isLoggedIn)
    console.log("userData: ", userData)
    if(!isLoggedIn || userData == null)
    {
      navigate('/login')
    }

    if (!pickup || !drop || !departureDate || !departureTime || !amount || !maxPeople) {
      alert('Please fill all required fields');
      return;
    }

    try {
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

      const { data } = await axios.post('/api/v1/rides/drop-ride', rideData, {
        withCredentials: true,
      });

      console.log('Ride successfully dropped:', data);
      alert('Ride dropped successfully!');
      navigate('/');
    } catch (error) {
      console.log('Error while dropping ride:', error);
      if(isLoggedIn && userData != null)
      {
        alert('Something went wrong while submitting the ride.')
      }

    }
  };

  if (!isLoaded) return <div>Loading…</div>;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box sx={{ width: '50%', p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ p: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Drop A Ride
          </Typography>
        </Stack>

        <TextField inputRef={pickupRef} label="Pickup Location" fullWidth autoComplete="off" />
        <TextField inputRef={dropRef} label="Drop Location" fullWidth autoComplete="off" />
        <TextField
          label="Max People"
          type="number"
          value={maxPeople}
          onChange={(e) => setMaxPeople(e.target.value)}
          fullWidth
        />
        <TextField
          label="Car Details (Optional)"
          value={carDetails}
          onChange={(e) => setCarDetails(e.target.value)}
          fullWidth
        />
        <TextField
          label="Amount to Pay"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
          fullWidth
        />
        <TextField
          type="date"
          label="Departure Date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: today }}
          fullWidth
        />
        <TextField
          type="time"
          label="Departure Time"
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: nowTime, step: 60 }}
          fullWidth
        />
        <Button variant="contained" onClick={handleSubmit}>
          Drop Ride
        </Button>
      </Box>

      <Box sx={{ width: '50%', height: '100%' }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          onLoad={onMapLoad}
          center={{ lat: 22.9734, lng: 78.6569 }}
          zoom={5}
        >
          {markers.map((p, i) => (
            <Marker key={i} position={p} />
          ))}
          {pickup && drop && (
            <DirectionsService
              options={{
                origin: pickup,
                destination: drop,
                travelMode: window.google.maps.TravelMode.DRIVING,
              }}
              callback={(r) => r?.status === 'OK' && setDirections(r)}
            />
          )}
          {directions && (
            <DirectionsRenderer
              options={{
                directions,
                suppressMarkers: false,
                preserveViewport: true,
              }}
            />
          )}
        </GoogleMap>
      </Box>
    </Box>
  );
};

export default DropRide;
