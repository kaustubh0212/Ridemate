// src/pages/Home.jsx
import React from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/img3.jpg';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        px: { xs: 3, sm: 8, md: 12 },
        overflow: 'hidden',
      }}
    >
      {/* Left Side */}
      <Box
        sx={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          justifyContent: 'center',
          pl: { xs: 2, sm: 6, md: 8 },
          pr: { xs: 2, sm: 6, md: 8 },
        }}
      >
        <Typography
          variant="h2"
          fontWeight="bold"
          color="black"
          sx={{ lineHeight: 1.2, fontFamily: 'Georgia, serif' }}
        >
          Your Journey,
          <br />
          Shared Beautifully
        </Typography>

        <Typography
          variant="h6"
          color="black"
          sx={{ fontStyle: 'italic', opacity: 0.85 }}
        >
          Travel smart. Save money. Meet awesome people along the way.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/drop-ride')}
            sx={{ borderRadius: 5, px: 5, fontWeight: 'bold', backgroundColor: '#000', '&:hover': { backgroundColor: '#333' } }}
          >
            Drop a Ride
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/find-ride')}
            sx={{
              borderRadius: 5,
              px: 5,
              color: 'black',
              borderColor: 'black',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#f0f0f0',
                borderColor: 'black',
              },
            }}
          >
            Find a Ride
          </Button>
        </Stack>
      </Box>

      {/* Right Side */}
      <Box
        component="img"
        src={backgroundImage}
        alt="Ride Sharing"
        sx={{
          width: '50%',
          maxHeight: '90vh',
          objectFit: 'cover',
          pr: { xs: 2, sm: 6, md: 8 },
        }}
      />
    </Box>
  );
};

export default Home;
