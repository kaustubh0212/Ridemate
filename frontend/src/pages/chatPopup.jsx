import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  useTheme,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import socket from "../socket.js";
import axios from "axios";
import { toast } from "react-toastify";

const ChatPopup = ({ rideId, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    socket.emit("joinRoom", { rideId });

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `/api/v1/chats/get-messages/${rideId}`,
          { withCredentials: true }
        );
        setMessages(data.data);
      } catch (error) {
        console.error("Failed to fetch messages", error);
        toast.error("Failed to load chat messages");
      }
    };
    fetchMessages();

    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("errorMessage", (err) => {
      toast.error(err.message);
    });

    return () => {
      socket.emit("leaveRoom", { rideId });
      socket.off("receiveMessage");
      socket.off("errorMessage");
    };
  }, [rideId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    socket.emit("sendMessage", {
      rideId,
      message: text.trim(),
    });
    setText("");
  };

  return (
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          right: 24,
          width: 320,
          height: 460,
          bgcolor: "#121212",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: "0px -4px 12px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 2000,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: "#1f1f1f",
            borderBottom: "1px solid #333",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Group Chat
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon sx={{ color: "#fff" }} />
          </IconButton>
        </Box>

        {/* Messages */}
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            px: 2,
            py: 1.5,
            overflowY: "auto",
            backgroundColor: "#1a1a1a",
          }}
        >
          {messages.map((msg, index) => {
            const isSelf = msg.sender._id === currentUser._id;
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: isSelf ? "flex-end" : "flex-start",
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: "75%",
                    bgcolor: isSelf ? "#2979ff33" : "#ffffff12",
                    color: "#fff",
                    backdropFilter: "blur(6px)",
                    border: isSelf
                      ? "1px solid #2979ff55"
                      : "1px solid #ffffff22",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ color: "#aaa" }}
                  >
                    {msg.sender.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: "break-word",
                      color: "#eee",
                    }}
                  >
                    {msg.message}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ borderColor: "#333" }} />

        {/* Input */}
        <Box
          sx={{
            px: 2,
            py: 1.2,
            borderTop: "1px solid #333",
            backgroundColor: "#1f1f1f",
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            variant="outlined"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            InputProps={{
              sx: {
                borderRadius: "24px",
                bgcolor: "#2c2c2c",
                color: "#fff",
                "& input": {
                  color: "#fff",
                },
                "& fieldset": {
                  borderColor: "#444",
                },
                "&:hover fieldset": {
                  borderColor: "#666",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2979ff",
                },
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleSend}
                    edge="end"
                    sx={{ color: "#90caf9" }}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>
    </Slide>
  );
};

export default ChatPopup;
