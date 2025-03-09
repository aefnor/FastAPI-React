import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import FileList from "./FilesList";
import FileUploader, { instance } from "../components/FileUploader";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

const LandingPage: React.FC = () => {
  const [promptText, setPromptText] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPromptText(event.target.value);
  };

  const handleSubmit = async () => {
    // Add user input to chat history
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { sender: "user", text: promptText },
    ]);

    try {
      // Send the prompt to the API and get the response
      const response = await instance.post("/converse", { query: promptText });

      // Assuming the response object has a `response` field with the bot's answer
      const botResponse = response.data.response;

      // Add the bot's response to the chat history
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: "bot", text: botResponse },
      ]);
    } catch (error) {
      console.error("Error submitting the prompt:", error);
    }

    // Clear the input field after submitting
    setPromptText("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 3,
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: "bold", marginBottom: 4 }}>
        Welcome to the Landing Page
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 500, marginBottom: 4 }}>
        <FileUploader />
      </Box>

      <Paper
        elevation={5}
        sx={{
          width: "100%",
          maxWidth: 600,
          padding: 4,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "medium", marginBottom: 3 }}>
          Enter your prompt below:
        </Typography>

        <TextField
          label="Enter Prompt"
          variant="outlined"
          fullWidth
          value={promptText}
          onChange={handleInputChange}
          sx={{
            marginBottom: 2,
            "& .MuiInputBase-root": {
              borderRadius: 2,
              backgroundColor: "#f9f9f9",
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{
            width: "100%",
            padding: "12px 0",
            fontWeight: "bold",
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          Submit Prompt
        </Button>
      </Paper>

      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          marginTop: 4,
          backgroundColor: "#ffffff",
          padding: 2,
          borderRadius: 2,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "medium", marginBottom: 2 }}>
          Chat History:
        </Typography>
        <List>
          {chatHistory.map((message, index) => (
            <ListItem
              key={index}
              sx={{ display: "flex", flexDirection: "column", marginBottom: 2 }}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: message.sender === "user" ? "bold" : "normal",
                      color: message.sender === "user" ? "#1976d2" : "#333",
                    }}
                  >
                    {message.text}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Uncomment when ready to show the file list */}
      {/* <FileList files={files} /> */}
    </Box>
  );
};

export default LandingPage;
