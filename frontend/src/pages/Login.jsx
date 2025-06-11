import React, { useState } from 'react';
import { Container, Box, Typography, Button, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = () => {
    alert('Google Login will be integrated.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: '#1e1e1e',
          p: 4,
          borderRadius: 3,
          color: 'white',
          width: '90%',
          mx: 'auto',
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          LOGIN
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <Box sx={{ mb: 2 }}>
            <label><strong>Name</strong></label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                marginTop: 5,
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #ccc',
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <label><strong>Email</strong></label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                marginTop: 5,
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #ccc',
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <label><strong>Password</strong></label>
            <input
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                marginTop: 5,
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #ccc',
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: '#000',
              color: 'white',
              width: '80%',
              mx: 'auto',
              display: 'block',
              borderRadius: 2,
              '&:hover': { backgroundColor: '#222' },
            }}
          >
            LOGIN
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
            <Divider sx={{ flexGrow: 1, backgroundColor: 'white' }} />
            <Typography sx={{ mx: 2, color: 'white', fontWeight: 'bold' }}>OR</Typography>
            <Divider sx={{ flexGrow: 1, backgroundColor: 'white' }} />
          </Box>

          <Button
            startIcon={<GoogleIcon />}
            variant="outlined"
            sx={{
              borderColor: 'white',
              color: 'white',
              borderRadius: 2,
              px: 2,
              width: '80%',
              mx: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textTransform: 'none',
              '& .MuiButton-startIcon': {
                marginRight: '8px',
              },
              '&:hover': { backgroundColor: '#333' },
            }}
            onClick={handleGoogleLogin}
          >
            Login with Google
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
