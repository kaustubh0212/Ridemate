import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const Login = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = () => {
    alert("Google Login will be integrated.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const FieldRow = ({ label, children }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 2,
        width: "100%",
      }}
    >
      <Typography
        sx={{
          minWidth: "120px",
          color: "white",
          fontWeight: "bold",
          mr: 2,
          userSelect: "none",
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "#1e1e1e",
          p: 4,
          borderRadius: 3,
          color: "white",
          width: "90%",
          mx: "auto",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          LOGIN
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1, width: "100%" }}
        >
          <FieldRow label="Name">
            <TextField
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{
                backgroundColor: "white",
                input: { color: "black", height: 30, padding: "6px 10px" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
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
                backgroundColor: "white",
                input: { color: "black", height: 30, padding: "6px 10px" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
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
                backgroundColor: "white",
                input: { color: "black", height: 30, padding: "6px 10px" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </FieldRow>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: "#000",
              color: "white",
              width: "80%",
              mx: "auto",
              display: "block",
              borderRadius: 2,
              "&:hover": { backgroundColor: "#222" },
            }}
          >
            LOGIN
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
            <Divider sx={{ flexGrow: 1, backgroundColor: "white" }} />
            <Typography sx={{ mx: 2, color: "white", fontWeight: "bold" }}>
              OR
            </Typography>
            <Divider sx={{ flexGrow: 1, backgroundColor: "white" }} />
          </Box>

          <Button
            startIcon={<GoogleIcon />}
            variant="outlined"
            sx={{
              borderColor: "white",
              color: "white",
              borderRadius: 2,
              px: 2,
              width: "80%",
              mx: "auto",
              display: "block",
              "&:hover": { backgroundColor: "#333" },
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
