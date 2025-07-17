import React from 'react';
import { Box, Button, Typography, Stack, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/img3.jpg';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        px: { xs: 3, sm: 8, md: 12 },
        py: { xs: 6, sm: 0 },
        overflow: 'hidden',
      }}
    >
      {/* Left Side */}
      <Box
        sx={{
          width: { xs: '100%', sm: '50%' },
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          justifyContent: 'center',
          alignItems: { xs: 'center', sm: 'flex-start' },
          textAlign: { xs: 'center', sm: 'left' },
          px: { xs: 2, sm: 6, md: 8 },
        }}
      >
        <Typography
          variant={isMobile ? 'h4' : 'h2'}
          fontWeight="bold"
          color="black"
          sx={{ lineHeight: 1.2, fontFamily: 'Georgia, serif' }}
        >
          Your Journey,
          <br />
          Shared Beautifully
        </Typography>

        <Typography
          variant="body1"
          color="black"
          sx={{ fontStyle: 'italic', opacity: 0.85 }}
        >
          Travel smart. Save money. Meet awesome people along the way.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ width: '100%', justifyContent: { sm: 'flex-start' }, alignItems: 'center' }}
        >
          <Button
            variant="contained"
            size="large"
            fullWidth={isMobile}
            onClick={() => navigate('/drop-ride')}
            sx={{
              borderRadius: 5,
              px: 5,
              py: 1.5,
              fontWeight: 'bold',
              backgroundColor: '#000',
              '&:hover': { backgroundColor: '#333' },
            }}
          >
            Drop a Ride
          </Button>

          <Button
            variant="outlined"
            size="large"
            fullWidth={isMobile}
            onClick={() => navigate('/find-ride')}
            sx={{
              borderRadius: 5,
              px: 5,
              py: 1.5,
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
      {!isMobile && (
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
      )}
    </Box>
  );
};

export default Home;
