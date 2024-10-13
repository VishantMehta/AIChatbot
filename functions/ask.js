import GPT4js from "gpt4js";
import fs from "fs";
import { performance } from "perf_hooks";

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

export const handler = async (event) => {
  try {
    const { input } = JSON.parse(event.body);
    if (!input) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Input is required" }),
      };
    }

    const messages = [{ role: "user", content: input }];

    const provider = GPT4js.createProvider(options.provider);
    const startTime = performance.now();
    const text = await provider.chatCompletion(messages, options);
    const responseTime = performance.now() - startTime;
    logResponseTime(input, text, responseTime);

    return {
      statusCode: 200,
      body: JSON.stringify({ response: text, responseTime: responseTime.toFixed(2) }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong" }),
    };
  }
};
