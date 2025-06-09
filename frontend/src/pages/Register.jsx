import React, { useState } from 'react';
import { Container, Box, Avatar, Typography, TextField, Button, IconButton, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';

const Input = styled('input')({ display: 'none' });

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    avatar: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const getInitialAvatar = () => {
    return formData.name ? formData.name[0].toUpperCase() : '?';
  };

  const handleGoogleLogin = () => {
    alert('Google Login will be integrated.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const FieldRow = ({ label, children }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 2,
        width: '100%',
        maxWidth: 350,
        mx: 'auto',
      }}
    >
      <Typography
        sx={{
          minWidth: '100px',
          color: 'white',
          fontWeight: 'bold',
          mr: 1,
          userSelect: 'none',
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Box>
  );

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: '#1e1e1e',
          p: 3,
          borderRadius: 3,
          color: 'white',
          width: '100%',
          maxWidth: 420,
          mx: 'auto',
        }}
      >
        <label htmlFor="avatar-upload">
          <Input accept="image/*" id="avatar-upload" type="file" name="avatar" onChange={handleChange} />
          <IconButton component="span" sx={{ p: 0 }}>
            <Avatar
              sx={{ width: 70, height: 70, bgcolor: '#555', fontSize: 26 }}
              src={formData.avatar ? URL.createObjectURL(formData.avatar) : ''}
            >
              {!formData.avatar && getInitialAvatar()}
            </Avatar>
          </IconButton>
        </label>

        <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
          REGISTER
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <FieldRow label="Name">
            <TextField
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white', // move it here
                  '& fieldset': {
                    borderRadius: 2,
                  },
                  input: {
                    color: 'black',
                    height: 30,
                    padding: '6px 10px',
                  },
                },
              }}
            />
          </FieldRow>

          <FieldRow label="Email">
            <TextField
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white', // move it here
                  '& fieldset': {
                    borderRadius: 2,
                  },
                  input: {
                    color: 'black',
                    height: 30,
                    padding: '6px 10px',
                  },
                },
              }}
            />
          </FieldRow>

          <FieldRow label="Phone No.">
            <TextField
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white', // move it here
                  '& fieldset': {
                    borderRadius: 2,
                  },
                  input: {
                    color: 'black',
                    height: 30,
                    padding: '6px 10px',
                  },
                },
              }}
            />
          </FieldRow>

          <FieldRow label="Password">
            <TextField
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white', // move it here
                  '& fieldset': {
                    borderRadius: 2,
                  },
                  input: {
                    color: 'black',
                    height: 30,
                    padding: '6px 10px',
                  },
                },
              }}
            />
          </FieldRow>

          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
              mb: 2,
              backgroundColor: '#000',
              color: 'white',
              borderRadius: 2,
              px: 4,
              width: '80%',
              mx: 'auto',
              display: 'block',
              '&:hover': { backgroundColor: '#222' },
            }}
          >
            REGISTER
          </Button>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              my: 2,
              width: '80%',
              mx: 'auto',
            }}
          >
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
              '&:hover': { backgroundColor: '#333' },
            }}
            onClick={handleGoogleLogin}
          >
            Register with Google
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
