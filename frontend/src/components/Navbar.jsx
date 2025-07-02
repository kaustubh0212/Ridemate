import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Avatar,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { useDispatch, useSelector } from 'react-redux';
import { authActions } from '../redux/store.js';
import axios from 'axios';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLogin);
  const userData = useSelector((state) => state.auth.user);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userName, setUserName] = useState('');

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  /*
  const fetchUser = async () => {
    console.log("running FetchUser()")
    try {
      const { data } = await axios.get('/api/v1/users/current-user', {
        withCredentials: true,
      });

      console.log("user data from FetchUser(): ", data)

      if (data) {
        setAvatarUrl(data.avatar);
        setUserName(data.user.name);
        setUserData(data);
        navigate("/")
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };
  */

  useEffect(() => {
    console.log('current navbar isLoggedIn status: ', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    console.log('current navbar avatar status: ', avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    if (userData != null) {
      setAvatarUrl(userData.avatar);
      setUserName(userData.name);
      console.log('userData in navbar: ', userData);
    } else if (userData == null) {
      console.log('userData in navbar: ', userData);
    }
  }, [userData]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/v1/users/logout', {}, { withCredentials: true });
      dispatch(authActions.logout());
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isHomeRoute = location.pathname === '/';

  const navItems = isHomeRoute
    ? [
        { label: 'Home', to: 'home' },
        { label: 'Services', to: 'services' },
        { label: 'About Us', to: 'about' },
      ]
    : [];

  const drawerContent = (
    <Box
      sx={{
        width: 250,
        backgroundColor: '#121212',
        height: '100%',
        color: 'white',
        p: 2,
      }}
      role="presentation"
      onClick={toggleDrawer}
    >
      <List>
        {/* Avatar at top */}
        {isLoggedIn && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar src={avatarUrl} alt={userName || 'U'} sx={{ width: 64, height: 64, fontSize: 28 }}>
              {!avatarUrl && (userName?.charAt(0) || 'U')}
            </Avatar>
          </Box>
        )}

        {isHomeRoute &&
          navItems.map((item) => (
            <ScrollLink
              key={item.label}
              to={item.to}
              smooth={true}
              duration={500}
              offset={-70}
              style={{ textDecoration: 'none', color: 'white' }}
            >
              <ListItem button>
                <ListItemText primary={item.label} />
              </ListItem>
            </ScrollLink>
          ))}

        <Divider sx={{ my: 1, backgroundColor: 'grey' }} />

        {isLoggedIn ? (
          <>
            <ListItemButton component={RouterLink} to="/your-rides">
              <ListItemText primary="Your Rides" />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </>
        ) : (
          <>
            <ListItemButton component={RouterLink} to="/login">
              <ListItemText primary="Login" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/register">
              <ListItemText primary="Register" />
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#121212', color: 'white' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ textDecoration: 'none', color: 'white', fontWeight: 'bold' }}
          >
            RideMate
          </Typography>

          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={toggleDrawer}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
                {drawerContent}
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {isHomeRoute &&
                navItems.map((item) => (
                  <ScrollLink
                    key={item.label}
                    to={item.to}
                    smooth={true}
                    duration={500}
                    offset={-70}
                    style={{ textDecoration: 'none', color: 'white' }}
                  >
                    <Button color="inherit">{item.label}</Button>
                  </ScrollLink>
                ))}

              {isLoggedIn ? (
                <>
                  <Button component={RouterLink} to="/your-rides" color="inherit" sx={{ fontWeight: 'bold' }}>
                    Your Rides
                  </Button>
                  <Button onClick={handleLogout} color="inherit">
                    Logout
                  </Button>
                  <Avatar src={avatarUrl} alt={userName || 'U'} sx={{ width: 32, height: 32, ml: 1, fontSize: 16 }}>
                    {!avatarUrl && (userName?.charAt(0) || 'U')}
                  </Avatar>
                </>
              ) : (
                <>
                  <Button component={RouterLink} to="/login" color="inherit">
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    sx={{ borderColor: 'white', color: 'white' }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
