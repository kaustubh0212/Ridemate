import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { DirectionsCar, Group, Chat } from '@mui/icons-material';
import { motion } from 'framer-motion';

const services = [
  {
    icon: <DirectionsCar fontSize="large" />,
    title: 'Drop a Ride',
    desc: 'Easily post your upcoming ride and allow other students to join for shared travel.',
  },
  {
    icon: <Group fontSize="large" />,
    title: 'Find Travel Partners',
    desc: 'Browse posted rides and connect with others heading to the same destination.',
  },
  {
    icon: <Chat fontSize="large" />,
    title: 'Group Chat',
    desc: 'Join a real-time chat with your co-riders to coordinate and stay updated.',
  },
];

const Service = () => {
  return (
    <Box sx={{ py: 10, px: { xs: 3, sm: 6, md: 12 }, backgroundColor: 'white', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Typography variant="h3" fontWeight="bold" mb={2}>
          Our Services
        </Typography>
        <Typography variant="body1" mb={4} sx={{ color: '#666' }}>
          Designed to simplify student travel planning through shared rides, connections, and coordination.
        </Typography>

        {/* <Button
          variant="outlined"
          sx={{
            mb: 6,
            px: 4,
            py: 1,
            borderRadius: 2,
            color: 'black',
            borderColor: 'black',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: 'black',
              color: 'white',
            },
          }}
        >
          Contact Us
        </Button> */}

        <Grid container spacing={4} justifyContent="center">
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.4 }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    backgroundColor: '#111',
                    color: 'white',
                    borderRadius: 4,
                    minHeight: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ mb: 2, fontSize: 40, color: '#5eead4' }}>
                    {service.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ccc' }}>
                    {service.desc}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Box>
  );
};

export default Service;
