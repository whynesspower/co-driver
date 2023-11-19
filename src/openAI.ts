require("dotenv").config();
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.USER_ID,
});

// const chatCompletion = await openai.chat.completions.create({
//   messages: [{ role: "user", content: "Explain me this code" }],
//   model: "gpt-3.5-turbo",
//   stream: true,
// });

// for await (const chat of chatCompletion) {
//   process.stdout.write(chat.choices[0]?.delta?.content || "");
// }
