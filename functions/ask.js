import GPT4js from "gpt4js";
import { createHandler } from 'serverless-http';
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const options = {
  provider: "Nextway",
  model: "gpt-4o-free",
};

app.post("/", async (req, res) => {
  const { input } = req.body; 
  if (!input) {
    return res.status(400).json({ error: "Input is required" });
  }

  const messages = [{ role: "user", content: input }];

  try {
    const provider = GPT4js.createProvider(options.provider);
    const text = await provider.chatCompletion(messages, options);
    res.json({ response: text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default createHandler(app);
