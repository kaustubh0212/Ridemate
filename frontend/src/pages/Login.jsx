import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { authActions } from '../redux/store.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Login = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLogin);

  const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  });


  const fetchUser = async () => {
    console.log("running FetchUser()")
    try {
      console.log("Backend URL for cookie login:", BACKEND_URL);
      const { data } = await axios.get(`${BACKEND_URL}/api/v1/users/current-user`, {
        withCredentials: true,
      });

      console.log("user data from FetchUser(): ", data)

      if(data?.data)
      {
        dispatch(authActions.login(data.data));
        /*
        setAvatarUrl(data.avatar);
        setUserName(data.user.name);
        setUserData(data);
        */
        navigate("/")
      }
    } catch (err) {
      console.log("No cookies saved to get fetched by fetchUser()");
    }
  };

    useEffect(() => {
      console.log("inside useEffect of FetchUser()");
      if (!isLoggedIn) fetchUser();
      console.log("current isLoggedIn status: ", isLoggedIn)
    }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = () => {
    alert('Google Login will be integrated.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Backend URL fo login:", BACKEND_URL);
    console.log('\nform data to go to backend: ', formData);
    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/v1/users/login`, {
        email: formData.email,
        password: formData.password,
        name: formData.name,
      }, {withCredentials: true});
      console.log('\nResponse coming back from backend: \n', data);
      console.log("data.success: ", data.success)
      if (data.success) {
        //localStorage.setItem("userId", data?.user._id);
        await dispatch(authActions.login(data.data.user));
        toast.success('User Login Successfully');
        navigate('/');
      } else
      {
        toast.error(`Error: ${data.message}`);
      }
    }
    catch(error)
    {
      console.error("Error in catch block: \n", error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(`Error: ${message}`);
    }
    finally
    {
    setFormData({
      name: "",
      email: "",
      password: "",
    })

  }}

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
            <label>
              <strong>Name</strong>
            </label>
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
            <label>
              <strong>Email</strong>
            </label>
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
            <label>
              <strong>Password</strong>
            </label>
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
        </Box>
      </Box>
    </Container>
  );
};

export default Login
