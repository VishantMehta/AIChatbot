import express from "express";
import cors from "cors";
import GPT4js from "gpt4js";
import fs from "fs";
import { performance } from "perf_hooks";
import path from "path"; 

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));

const options = {
  provider: "Nextway",
  model: "gpt-4o-free",
};

const logResponseTime = (input, response, responseTime) => {
  const logMessage = `User Input: ${input}\nAI Response: ${response}\nResponse Time: ${responseTime.toFixed(2)} ms\n\n`;
  fs.appendFile("response_logs.txt", logMessage, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
};

const chatHistories = new Map();

app.post("/api/ask", async (req, res) => {
  const { input, sessionId } = req.body;
  if (!input) {
    return res.status(400).json({ error: "Input is required" });
  }

  const history = chatHistories.get(sessionId) || [];
  history.push({ role: "user", content: input });

  if (history.length > 4) {
    history.shift();
  }

  try {
    const provider = GPT4js.createProvider(options.provider);
    const startTime = performance.now();
    const text = await provider.chatCompletion(history, options);
    const responseTime = performance.now() - startTime;

    logResponseTime(input, text, responseTime);
    history.push({ role: "assistant", content: text });
    chatHistories.set(sessionId, history);

    res.json({ response: text, responseTime: responseTime.toFixed(2) });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
export default app;
