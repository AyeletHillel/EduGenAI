import { Configuration, OpenAIApi } from "openai";
import { config } from "dotenv";
config();

const openAi = new OpenAIApi(
    new Configuration({
      apiKey: process.env.OPEN_AI_API_KEY,
    })
);

const chatgpt = async (input) => {
    const response = await openAi.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: input }],
    });
    
    // Return the message content instead of logging it
    return response.data.choices[0].message.content;
}

export default chatgpt;

