import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import socket from "../socket.js"
import axios from "axios";

const ChatPopup = ({ rideId, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
  socket.on('connect', () => {
    console.log('✅ Connected to socket:', socket.id);
  });

  return () => {
    socket.off('connect');
  };
}, []);

  useEffect(() => {
    // Join chat room
    socket.emit("joinRoom", { rideId });
    

    // Fetch previous messages
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/api/v1/rides/${rideId}/messages`);
        setMessages(data.messages);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };
    fetchMessages();

    // Listen for new messages
    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.emit("leaveRoom", { rideId });
      socket.off("receiveMessage");
    };
  }, [rideId]);

  useEffect(() => {
    // Auto scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      socket.emit("sendMessage", {
        rideId,
        sender: currentUser._id,
        message: text,
      });
      setText("");
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 70,
        right: 20,
        width: 360,
        height: 480,
        bgcolor: "#fff",
        boxShadow: 6,
        borderRadius: 2,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1.5,
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h6">Group Chat</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ color: "white" }} />
        </IconButton>
      </Box>

      <Divider />

      {/* Messages */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              mb: 1.5,
              display: "flex",
              flexDirection:
                msg.sender._id === currentUser._id ? "row-reverse" : "row",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor:
                  msg.sender._id === currentUser._id
                    ? "primary.light"
                    : "grey.300",
                borderRadius: 2,
                maxWidth: "75%",
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {msg.sender.name}
              </Typography>
              <Typography variant="body2">{msg.message}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Input */}
      <Box
        sx={{
          p: 1.5,
          borderTop: "1px solid #ccc",
          display: "flex",
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button variant="contained" onClick={handleSend}>
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default ChatPopup;
