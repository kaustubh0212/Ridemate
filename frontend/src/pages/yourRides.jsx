import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Divider, Stack, Chip, useMediaQuery, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const pickupDropStyle = {
  width: '15%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '180px',
};

const buttonStyle = {
  textTransform: 'none',
  fontSize: '0.75rem',
};

const YourRides = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [viewType, setViewType] = useState('dropped');
  const [droppedRides, setDroppedRides] = useState([]);
  const [searchedRides, setSearchedRides] = useState([]);
  const { user } = useSelector((state) => state.auth);

  const fetchDroppedRides = async () => {
    try {
      const { data } = await axios.get('/api/v1/rides/dropped-rides', {
        withCredentials: true,
      });
      setDroppedRides(data.rides);
    } catch (error) {
      console.error('Failed to fetch dropped rides:', error);
    }
  };

  const fetchSearchedRides = async () => {
    try {
      const { data } = await axios.get('/api/v1/rides/searched-rides', {
        withCredentials: true,
      });
      setSearchedRides(data.rides);
    } catch (error) {
      console.error('Failed to fetch searched rides:', error);
    }
  };

  const handleMoveOut = async (rideId) => {
    try {
      await axios.post(`/api/v1/rides/move-out/${rideId}`, {}, { withCredentials: true });
      toast.success('You have Moved Out Successfully');
      fetchSearchedRides();
    } catch (err) {
      console.error(err);
      toast.error('Failed to move out of the ride');
    }
  };

  useEffect(() => {
    fetchDroppedRides();
    fetchSearchedRides();
  }, []);


  const renderDroppedRideRow = (ride, index) => {
    const bgColor = index % 2 === 0 ? '#ededed' : '#ffffff';

    return (
      <Box
        key={ride._id}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          backgroundColor: bgColor,
          borderBottom: '1px solid #ccc',
          gap: 1,
        }}
      >
        <Typography sx={{ width: '5%' }}>{index + 1}</Typography>
        <Typography sx={pickupDropStyle} title={ride.pickupLocation.name}>
          {ride.pickupLocation.name}
        </Typography>
        <Typography sx={pickupDropStyle} title={ride.dropLocation.name}>
          {ride.dropLocation.name}
        </Typography>
        <Typography sx={{ width: '10%' }}>{ride.departureDate}</Typography>
        <Typography sx={{ width: '%' }}>{ride.departureTime}</Typography>
        <Box sx={{ width: '11%' }}>
          <Chip
            label={ride.status}
            color={ride.status === 'pending' ? 'warning' : ride.status === 'completed' ? 'success' : 'error'}
          />
        </Box>
        <Typography sx={{ width: '8%' }}>{`${ride.joinedUser?.length || 0} joined`}</Typography>
        <Box sx={{ width: '15%' }}>
          <Button variant="outlined" fullWidth onClick={() => navigate(`/ride/${ride._id}`)} sx={buttonStyle}>
            More Details
          </Button>
        </Box>
      </Box>
    );
  };

  const renderSearchedRideRow = (ride, index) => {
    const bgColor = index % 2 === 0 ? '#ededed' : '#ffffff';

    return (
      <Box
        key={ride._id}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          backgroundColor: bgColor,
          borderBottom: '1px solid #ccc',
          gap: 1,
        }}
      >
        <Typography sx={{ width: '5%' }}>{index + 1}</Typography>
        <Typography sx={pickupDropStyle} title={ride.pickupLocation.name}>
          {ride.pickupLocation.name}
        </Typography>
        <Typography sx={pickupDropStyle} title={ride.dropLocation.name}>
          {ride.dropLocation.name}
        </Typography>
        <Typography sx={{ width: '10%' }}>{ride.departureDate}</Typography>
        <Typography sx={{ width: '10%' }}>{ride.departureTime}</Typography>
        <Box sx={{ width: '10%' }}>
          <Chip
            label={ride.status}
            color={ride.status === 'pending' ? 'warning' : ride.status === 'completed' ? 'success' : 'error'}
          />
        </Box>
        <Typography sx={{ width: '10%' }}>{ride.requestStatus || 'Pending'}</Typography>
        <Box sx={{ width: '10%' }}>
          <Button variant="outlined" fullWidth color="error" onClick={() => handleMoveOut(ride._id)} sx={buttonStyle}>
            Move Out
          </Button>
        </Box>
        <Box sx={{ width: '10%' }}>
          <Button variant="contained" fullWidth onClick={() => navigate(`/chat/${ride._id}`)} sx={buttonStyle}>
            Chat
          </Button>
        </Box>
      </Box>
    );
  };

  const ridesToDisplay = viewType === 'dropped' ? droppedRides : searchedRides;

  return (
    <Box sx={{ p: 4, backgroundColor: '#fff', color: '#000', minHeight: '100vh' }}>
      {/* Top buttons */}
      <Stack direction="row" spacing={2} mb={4}>
        <Button
          variant={viewType === 'dropped' ? 'contained' : 'outlined'}
          onClick={() => setViewType('dropped')}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Dropped Rides
        </Button>
        <Button
          variant={viewType === 'searched' ? 'contained' : 'outlined'}
          onClick={() => setViewType('searched')}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Searched Rides
        </Button>
      </Stack>

      {/* Header */}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {viewType === 'dropped' ? 'Dropped Ride Details' : 'Searched Ride Details'}
      </Typography>

      {/* Column Titles */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: '#f0f0f0',
          borderRadius: 2,
          mb: 1,
          fontWeight: 'bold',
        }}
      >
        <Typography sx={{ width: isMobile ? '100%' : '5%' }}>S.No.</Typography>
        <Typography sx={{ width: isMobile ? '100%' : '15%' }}>Pickup</Typography>
        <Typography sx={{ width: isMobile ? '100%' : '15%' }}>Drop</Typography>
        <Typography sx={{ width: isMobile ? '100%' : '10%' }}>Date</Typography>
        <Typography sx={{ width: isMobile ? '100%' : '12%' }}>Time</Typography>
        <Typography sx={{ width: isMobile ? '100%' : '9.5%' }}>Status</Typography>
        <Typography sx={{ width: isMobile ? '100%' : '13%' }}>
          {viewType === 'dropped' ? 'People Joined' : 'Request Status'}
        </Typography>
        <Typography sx={{ width: isMobile ? '100%' : '10%' }}>
          {viewType === 'dropped' ? 'Details' : 'Move Out'}
        </Typography>
        {viewType === 'searched' && <Typography sx={{ width: isMobile ? '100%' : '10%' }}>Chat</Typography>}
      </Box>

      <Divider sx={{ backgroundColor: '#ccc', mb: 1 }} />

      {ridesToDisplay.length === 0 ? (
        <Typography textAlign="center" mt={4}>
          No rides to display.
        </Typography>
      ) : (
        ridesToDisplay.map((ride, index) =>
          viewType === 'dropped' ? renderDroppedRideRow(ride, index) : renderSearchedRideRow(ride, index)
        )
      )}
    </Box>
  );
};

export default YourRides;
