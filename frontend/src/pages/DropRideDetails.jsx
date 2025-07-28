import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Stack,
  Divider,
  Chip,
  Paper,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import socket from '../socket.js';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const RideManage = () => {
  const { rideId } = useParams();
  const [ride, setRide] = useState(null);
  const [joinedUsers, setJoinedUsers] = useState([]);
  const [requestedUsers, setRequestedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    socket.on('connect', () => {
      console.log('User Connected To Socket:', socket.id);
    });
    return () => socket.off('connect');
  }, []);

  const fetchRideDetails = async () => {
    try {
      console.log("Backend URL for FetchRideDetails:", BACKEND_URL);
      const { data } = await axios.get(`${BACKEND_URL}/api/v1/rides/ride-detail/${rideId}`, { withCredentials: true });
      setRide(data.data.rideDetails);
      setJoinedUsers(data.data.joinedUsers);
      setRequestedUsers(data.data.requestedUsers);
    } catch {
      toast.error('Failed to load ride info');
    }
  };

  const fetchMessages = async () => {
    try {
      console.log("Backend URL for FetchMessages:", BACKEND_URL);
      const { data } = await axios.get(`${BACKEND_URL}/api/v1/chats/get-messages/${rideId}`, { withCredentials: true });
      setMessages(data.data);
    } catch {
      toast.error('Failed to load messages');
    }
  };

  const handleAccept = async (userId) => {
    try {
      console.log("Backend URL for AcceptRequest:", BACKEND_URL);
      await axios.post(`${BACKEND_URL}/api/v1/rides/accept-request/${rideId}/${userId}`, {}, { withCredentials: true });
      toast.success('User accepted');
      fetchRideDetails();
    } catch {
      toast.error('Failed To Accept User. Please Retry');
    }
  };

  const handleCancelRide = async () => {
    try {
      console.log("Backend URL for HandleCancelRide:", BACKEND_URL);
      await axios.patch(`${BACKEND_URL}/api/v1/rides/cancel-ride/${rideId}`, {}, { withCredentials: true });
      toast.success('Ride cancelled');
      fetchRideDetails();
    } catch {
      toast.error('Failed to cancel ride');
    }
  };

  const handleSendMessage = () => {
    if (text.trim() !== '') {
      socket.emit('sendMessage', { rideId, message: text });
      setText('');
    }
  };

  useEffect(() => {
    fetchRideDetails();
    fetchMessages();
    socket.emit('joinRoom', { rideId });
    socket.on('receiveMessage', (msg) => setMessages((prev) => [...prev, msg]));
    return () => socket.off('receiveMessage');
  }, [rideId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!ride) return <Typography>Loading...</Typography>;

  return (
    <Box minHeight="100vh" bgcolor="#f5f5f5" py={isMobile ? 2 : 4}>
      <Box p={isMobile ? 2 : 4} maxWidth="900px" mx="auto">
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign={isMobile ? 'center' : 'left'}>
          Manage Ride
        </Typography>

        <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
          <CardContent>
            <Stack spacing={1}>
              <Typography>
                <strong>Pickup:</strong> {ride.pickupLocation.name}
              </Typography>
              <Typography>
                <strong>Drop:</strong> {ride.dropLocation.name}
              </Typography>
              <Typography>
                <strong>Date:</strong> {ride.departureDate}
              </Typography>
              <Typography>
                <strong>Time:</strong> {ride.departureTime}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontWeight="bold">Status:</Typography>
                <Chip label={ride.status} color={ride.status === 'pending' ? 'warning' : 'error'} />
              </Box>
            </Stack>

            {ride.status === 'pending' && (
              <Button color="error" variant="contained" onClick={handleCancelRide} sx={{ mt: 2 }}>
                Cancel Ride
              </Button>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Joined Users
            </Typography>
            <Stack spacing={1}>
              {joinedUsers?.length === 0 ? (
                <Typography>No users joined yet</Typography>
              ) : (
                joinedUsers?.map((user) => (
                  <Stack key={user._id} direction="row" spacing={2} alignItems="center">
                    <Avatar src={user.avatar?.url} />
                    <Typography>
                      {user.name} ({user.email})
                    </Typography>
                  </Stack>
                ))
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Requested Users
            </Typography>
            <Stack spacing={1}>
              {requestedUsers?.length === 0 ? (
                <Typography>No requests</Typography>
              ) : (
                requestedUsers?.map((user) => (
                  <Stack key={user._id} direction="row" spacing={2} alignItems="center">
                    <Avatar src={user.avatar?.url} />
                    <Typography>
                      {user.name} ({user.email})
                    </Typography>
                    <Button variant="outlined" size="small" onClick={() => handleAccept(user._id)}>
                      Accept
                    </Button>
                  </Stack>
                ))
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Group Chat
            </Typography>

            <Paper
              variant="outlined"
              sx={{ maxHeight: 300, overflowY: 'auto', mb: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}
            >
              {messages.map((msg, i) => (
                <Box key={i} mb={1}>
                  <Typography variant="body2" fontWeight="bold">
                    {msg.sender?.name}:
                  </Typography>
                  <Typography variant="body2">{msg.message}</Typography>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Paper>

            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <IconButton color="primary" onClick={handleSendMessage}>
                <SendIcon />
              </IconButton>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default RideManage;
