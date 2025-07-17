import React from 'react';
import { Box, Typography, Grid, Avatar, Stack, IconButton, useTheme } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, GitHub } from '@mui/icons-material';
import akshat from "../assets/akshat.jpg"
import kaustubh from "../assets/professional profile pic.jpg"

const teamMembers = [
  {
    name: 'KAUSTUBH AGRAWAL',
    role: 'Backend',
    description: 'Code wizard focused on scalable systems and innovative backend solutions.',
    image: kaustubh, // update with real path or use a hosted URL
    socials: {
      //facebook: '#',
      //twitter: '#',
      //instagram: '#',
      linkedin: 'https://www.linkedin.com/in/kaustubh-agrawal-50186a251/',
      github: 'https://github.com/kaustubh0212'
    },
  },
  {
    name: 'AKSHAT CHAUDHARY',
    role: 'Frontend',
    description: 'Passionate about designing seamless digital experiences and building user-centric apps.',
    image: akshat,
    socials: {
      //facebook: '#',
      //twitter: '#',
      //instagram: '#',
      linkedin: 'https://www.linkedin.com/in/akshatt-choudhary-913a46265/',
      github: 'https://github.com/kaustubh0212'
    },
  },
];

const AboutUs = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: 8,
        px: { xs: 2, sm: 4, md: 10 },
        backgroundColor: '#fff',
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" fontWeight="bold" color="black" mb={1}>
        Our Team
      </Typography>
      <Typography variant="body1" color="gray" mb={6}>
        Meet the minds shaping your travel experience
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {teamMembers.map((member, index) => (
          <Grid item xs={12} md={5} key={index}>
            <Box
              sx={{
                backgroundColor: '#f5f5f5',
                p: 4,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
              }}
            >
              <Avatar
                src={member.image}
                alt={member.name}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                }}
              />
              <Typography variant="h6" fontWeight="bold" color="black">
                {member.name}
              </Typography>
              <Typography
                variant="subtitle2"
                color="gray"
                fontStyle="italic"
                mb={2}
              >
                {member.role}
              </Typography>
              <Typography
                variant="body2"
                color="black"
                sx={{ opacity: 0.8, mb: 3 }}
              >
                {member.description}
              </Typography>

              <Stack direction="row" justifyContent="center" spacing={2}>
               
                <IconButton href={member.socials.linkedin} target="_blank">
                  <LinkedIn sx={{ color: '#000' }} />
                </IconButton>
                <IconButton href={member.socials.github} target="_blank">
                  <GitHub sx={{ color: '#000' }} />
                </IconButton>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Typography variant="caption" color="gray" mt={8} display="block">
        © 2025 | Built with ❤️ by Kaustubh Agrawal and Akshat Chaudhary
      </Typography>
    </Box>
  );
};

export default AboutUs;
