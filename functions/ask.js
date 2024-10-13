import GPT4js from "gpt4js";
import express from "express";
import cors from "cors";
import fs from "fs";
import { performance } from "perf_hooks"; // for measuring response time

const app = express();
app.use(cors());
app.use(express.json());

const options = {
  provider: "Nextway",
  model: "gpt-4o-free",
};

// Function to log response time and details
const logResponseTime = (input, response, responseTime) => {
  const logMessage = `User Input: ${input}\nAI Response: ${response}\nResponse Time: ${responseTime.toFixed(2)} ms\n\n`;
  fs.appendFile("response_logs.txt", logMessage, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
};

// API endpoint for handling AI requests
app.post("/api/ask", async (req, res) => {
  const { input } = req.body;
  if (!input) {
    return res.status(400).json({ error: "Input is required" });
  }

  const messages = [{ role: "user", content: input }];

  try {
    // Set up the GPT-4 provider
    const provider = GPT4js.createProvider(options.provider);
    const startTime = performance.now();

    // Get AI response
    const text = await provider.chatCompletion(messages, options);
    const responseTime = performance.now() - startTime;

    // Log the response time
    logResponseTime(input, text, responseTime);

    // Send the response back to the client
    res.json({ response: text, responseTime: responseTime.toFixed(2) });
  } catch (error) {
    console.error("Error processing request:", error);
    // Send the full error message to the log
    fs.appendFile("error_logs.txt", `${new Date().toISOString()}: ${error.stack}\n`, (err) => {
      if (err) {
        console.error("Error writing to error log file:", err);
      }
    });

    // Return a simplified error message
    res.status(500).json({ error: "Something went wrong while processing your request. Please try again later." });
  }
});

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
