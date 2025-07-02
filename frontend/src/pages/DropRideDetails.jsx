import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Avatar, Stack, Divider, Chip } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const RideManage = () => {
  const { rideId } = useParams();
  const [ride, setRide] = useState(null);
  const [joinedUsers, setJoinedUsers] = useState(null);
  const [requestedUsers, setRequestedUsers] = useState(null);

  const fetchRideDetails = async () => {
    try {
      const { data } = await axios.get(`/api/v1/rides/ride-detail/${rideId}`, { withCredentials: true });
      setRide(data.data.rideDetails);
      setJoinedUsers(data.data.joinedUsers);
      setRequestedUsers(data.data.requestedUsers);

      console.log("Fetched completeRideDetails successfully: \n", data)
    } catch (err) {
      console.log("completeRideDetails could not be fetched")
      toast.error('Failed to load ride info');
    }
  };

  const handleAccept = async (userId) => {
    try {
      await axios.post(`/api/v1/rides/accept-request/${rideId}/${userId}`, {}, { withCredentials: true });
      toast.success('User accepted');
      fetchRideDetails();
    } catch {
      toast.error('Failed To Accept User. PLease Retry');
    }
  };

  const handleCancelRide = async () => {
    try {
      await axios.patch(`/api/v1/rides/cancel/${rideId}`, {}, { withCredentials: true });
      toast.success('Ride cancelled');
      fetchRideDetails();
    } catch {
      toast.error('Failed to cancel ride');
    }
  };

  useEffect(() => {
    fetchRideDetails();
  }, []);

  if (!ride) return <Typography>Loading...</Typography>;

  return (
  <Box p={4}>
    <Typography variant="h4" gutterBottom>Manage Ride</Typography>

    {ride ? (
      <>
        <Stack spacing={1} mb={2}>
          <Typography><strong>Pickup:</strong> {ride.pickupLocation.name}</Typography>
          <Typography><strong>Drop:</strong> {ride.dropLocation.name}</Typography>
          <Typography><strong>Date:</strong> {ride.departureDate}</Typography>
          <Typography><strong>Time:</strong> {ride.departureTime}</Typography>
          <Typography><strong>Status:</strong> 
            <Chip label={ride.status} color={ride.status === 'pending' ? 'warning' : 'error'} />
          </Typography>
        </Stack>

        <Button color="error" variant="contained" onClick={handleCancelRide}>
          Cancel Ride
        </Button>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6">Joined Users</Typography>
        <Stack spacing={1}>
          {joinedUsers?.length === 0 ? (
            <Typography>No users joined yet</Typography>
          ) : (
            joinedUsers?.map((user) => (
              <Stack key={user._id} direction="row" spacing={2} alignItems="center">
                <Avatar src={user.avatar?.url} />
                <Typography>{user.name} ({user.email})</Typography>
              </Stack>
            ))
          )}
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6">Requested Users</Typography>
        <Stack spacing={1}>
          {requestedUsers?.length === 0 ? (
            <Typography>No requests</Typography>
          ) : (
            requestedUsers?.map((user) => (
              <Stack key={user._id} direction="row" spacing={2} alignItems="center">
                <Avatar src={user.avatar?.url} />
                <Typography>{user.name} ({user.email})</Typography>
                <Button variant="outlined" size="small" onClick={() => handleAccept(user._id)}>
                  Accept
                </Button>
              </Stack>
            ))
          )}
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/groupchat/${ride._id}`)}
        >
          Open Group Chat
        </Button>
      </>
    ) : (
      <Typography>Loading ride data...</Typography>
    )}
  </Box>
);

};

export default RideManage;
