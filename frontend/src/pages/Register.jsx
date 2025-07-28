import React, { useState } from 'react';
import { Container, Box, Avatar, Typography, Button, IconButton, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Input = styled('input')({ display: 'none' });

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    avatar: null,
  });

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Backend URL:", BACKEND_URL);
    console.log('Frontend Data to be sent:\n', formData);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('avatar', formData.avatar); // crucial for multer

      if (!formData.avatar) {
        toast.error('Please upload an avatar image');
        return;
      }

      const { data } = await axios.post(`${BACKEND_URL}/api/v1/users/register`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      console.log('Response: \n', data);

      if (data.success) {
        toast.success('User Registered Successfully');
        navigate('/login');
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error in catch block: \n", error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(`Error: ${message}`);
    }
    finally
    {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      avatar: null
    });
  }
  };

  const getInitialAvatar = () => (formData.name ? formData.name[0].toUpperCase() : '?');

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: '24px',
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

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Box sx={{ mt: 1.5, width: '100%', color: 'white' }}>
            <label>
              <strong>Name</strong>
            </label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
          </Box>

          <Box sx={{ mt: 1.5, width: '100%' }}>
            <label>
              <strong>Email</strong>
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
            />
          </Box>

          <Box sx={{ mt: 1.5, width: '100%' }}>
            <label>
              <strong>Phone</strong>
            </label>
            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} />
          </Box>

          <Box sx={{ mt: 1.5, width: '100%' }}>
            <label>
              <strong>Password</strong>
            </label>
            <input
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
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

          {/* <Box
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
          </Box> */}

          {/* <Button
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
              justifyContent: 'center',
              '&:hover': { backgroundColor: '#333' },
            }}
          >
            Register with Google
          </Button> */}
        </form>
      </Box>
    </Container>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  marginTop: '5px',
  backgroundColor: '#fff',
  color: '#000',
};

export default Register;
