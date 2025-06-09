// src/components/Navbar.jsx
import React, { useState } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const isHomeRoute = location.pathname === "/";

  const navItems = isHomeRoute
    ? [
        { label: "Home", to: "home" },
        { label: "Services", to: "services" },
        { label: "About Us", to: "about" },
      ]
    : [];

  const drawerContent = (
    <Box
      sx={{
        width: 250,
        backgroundColor: "#121212",
        height: "100%",
        color: "white",
      }}
      role="presentation"
      onClick={toggleDrawer}
    >
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.label}>
            <ScrollLink
              to={item.to}
              smooth={true}
              duration={500}
              offset={-70}
              style={{ textDecoration: "none", color: "white", width: "100%" }}
            >
              <ListItemText primary={item.label} />
            </ScrollLink>
          </ListItem>
        ))}
        <ListItem button component={RouterLink} to="/login">
          <ListItemText primary="Login" />
        </ListItem>
        <ListItem button component={RouterLink} to="/register">
          <ListItemText primary="Register" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#121212", color: "white" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ textDecoration: "none", color: "white", fontWeight: "bold" }}
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
            <Box sx={{ display: "flex", gap: 2 }}>
              {isHomeRoute &&
                navItems.map((item) => (
                  <ScrollLink
                    key={item.label}
                    to={item.to}
                    smooth={true}
                    duration={500}
                    offset={-70}
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    <Button color="inherit">{item.label}</Button>
                  </ScrollLink>
                ))}
              <Button component={RouterLink} to="/login" color="inherit">
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="outlined"
                sx={{ borderColor: "white", color: "white" }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
