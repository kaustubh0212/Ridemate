import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Divider, Stack, Chip, useMediaQuery, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatPopup from '../pages/chatPopup';

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
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();

  const [viewType, setViewType] = useState('dropped');
  const [droppedRides, setDroppedRides] = useState([]);
  const [searchedRides, setSearchedRides] = useState([]);
  const [openChat, setOpenChat] = useState(null);
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

  const handleChatClick = (rideId) => {
    setOpenChat(rideId);
  };

  const handleCloseChat = () => {
    setOpenChat(null);
  };

  const renderDroppedRideRow = (ride, index) => {
    const bgColor = index % 2 === 0 ? '#ededed' : '#ffffff';

    return (
      <Box
        key={ride._id}
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          p: 2,
          backgroundColor: bgColor,
          borderBottom: '1px solid #ccc',
          gap: 1,
        }}
      >
        {!isMobile && <Typography sx={{ width: '5%' }}>{index + 1}</Typography>}
        <Typography
          sx={{
            width: isMobile ? '100%' : '15%',
            fontWeight: isMobile ? 500 : 'normal',
          }}
        >
          📍 Pickup: {ride.pickupLocation.name}
        </Typography>
        <Typography
          sx={{
            width: isMobile ? '100%' : '15%',
            fontWeight: isMobile ? 500 : 'normal',
          }}
        >
          🎯 Drop: {ride.dropLocation.name}
        </Typography>

        <Typography sx={{ width: isMobile ? '100%' : '10%' }}>{ride.departureDate}</Typography>
        <Typography sx={{ width: isMobile ? '100%' : '10%' }}>{ride.departureTime}</Typography>
        <Box sx={{ width: isMobile ? '100%' : '11%' }}>
          <Chip
            label={ride.status}
            color={ride.status === 'pending' ? 'warning' : ride.status === 'completed' ? 'success' : 'error'}
          />
        </Box>
        <Box sx={{ width: isMobile ? '100%' : '15%' }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate(`/dropRide-details/${ride._id}`)}
            sx={buttonStyle}
          >
            Details
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
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          p: 2,
          backgroundColor: bgColor,
          borderBottom: '1px solid #ccc',
          gap: 1,
        }}
      >
        {!isMobile && <Typography sx={{ width: '5%' }}>{index + 1}</Typography>}
        <Typography
          sx={{
            width: isMobile ? '100%' : '15%',
            fontWeight: isMobile ? 500 : 'normal',
          }}
        >
          📍 Pickup: {ride.pickupLocation.name}
        </Typography>
        <Typography
          sx={{
            width: isMobile ? '100%' : '15%',
            fontWeight: isMobile ? 500 : 'normal',
          }}
        >
          🎯 Drop: {ride.dropLocation.name}
        </Typography>

        <Typography sx={{ width: isMobile ? '100%' : '10%' }}>{ride.departureDate}</Typography>
        <Typography sx={{ width: isMobile ? '100%' : '10%' }}>{ride.departureTime}</Typography>
        <Box sx={{ width: isMobile ? '100%' : '10%' }}>
          <Chip
            label={ride.status}
            color={ride.status === 'pending' ? 'warning' : ride.status === 'completed' ? 'success' : 'error'}
          />
        </Box>
        <Typography sx={{ width: isMobile ? '100%' : '10%' }}>{ride.requestStatus || 'Pending'}</Typography>
        <Box sx={{ width: isMobile ? '100%' : '10%' }}>
          <Button variant="outlined" fullWidth color="error" onClick={() => handleMoveOut(ride._id)} sx={buttonStyle}>
            Move Out
          </Button>
        </Box>
        <Box sx={{ width: isMobile ? '100%' : '10%' }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleChatClick(ride._id)}
            sx={buttonStyle}
            disabled={ride.requestStatus === 'Pending'}
          >
            Chat
          </Button>
        </Box>
      </Box>
    );
  };

  const ridesToDisplay = viewType === 'dropped' ? droppedRides : searchedRides;

  return (
    <Box sx={{ p: 4, backgroundColor: '#fff', color: '#000', minHeight: '100vh' }}>
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

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {viewType === 'dropped' ? 'Dropped Ride Details' : 'Searched Ride Details'}
      </Typography>

      {!isMobile && viewType === 'dropped' && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#f0f0f0',
            p: 2,
            borderRadius: 2,
            mb: 1,
          }}
        >
          <Typography sx={{ width: '5%' }}>S.No.</Typography>
          <Typography sx={{ width: '15%' }}>Pickup</Typography>
          <Typography sx={{ width: '15%' }}>Drop</Typography>
          <Typography sx={{ width: '10%' }}>Date</Typography>
          <Typography sx={{ width: '10%' }}>Time</Typography>
          <Typography sx={{ width: '11%' }}>Status</Typography>
          <Typography sx={{ width: '8%' }}>People Joined</Typography>
          <Typography sx={{ width: '15%' }}>Details</Typography>
        </Box>
      )}

      {!isMobile && viewType === 'searched' && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#f0f0f0',
            p: 2,
            borderRadius: 2,
            mb: 1,
          }}
        >
          <Typography sx={{ width: '5%' }}>S.No.</Typography>
          <Typography sx={{ width: '15%' }}>Pickup</Typography>
          <Typography sx={{ width: '15%' }}>Drop</Typography>
          <Typography sx={{ width: '10%' }}>Date</Typography>
          <Typography sx={{ width: '10%' }}>Time</Typography>
          <Typography sx={{ width: '10%' }}>Status</Typography>
          <Typography sx={{ width: '10%' }}>Request Status</Typography>
          <Typography sx={{ width: '10%' }}>Move Out</Typography>
          <Typography sx={{ width: '10%' }}>Chat</Typography>
        </Box>
      )}

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

      {openChat && <ChatPopup rideId={openChat} currentUser={user} onClose={handleCloseChat} />}
    </Box>
  );
};

export default YourRides;
