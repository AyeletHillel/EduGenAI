import dotenv from 'dotenv';
import readline from 'readline';
import chatgpt from './chatgpt.js';
import standards from './standards.json' assert { type: 'json' }; // Import the JSON file

const textTypes = standards["Text Types and Purposes"];

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let studentInterestTopic = null; // Variable to store the Student Interest Topic


const generateFRQ = async (topic) => {
    const textTypeKeys = Object.keys(textTypes);
    const randomTextTypeKey = textTypeKeys[Math.floor(Math.random() * textTypeKeys.length)];
    const textType = textTypes[randomTextTypeKey];
    const description = textType.description;
    const instructions = textType.instructions;

    const prompt = `
    You are a 4th-grade curriculum developer tasked with creating content based on the provided data.
    
    Data: 
    Student selected topic: ${topic}
    Writing standard: description: ${description}, instructions: ${instructions}
    
    Generate the Free Response Question:
    Generate a free response question suitable for a 4th grader. The question should be based on the topic of ${topic} and the writing standard provided.
    
    Provide Context for the User:
    Generate a brief context about ${topic} to help a 4th grader understand the basics before they answer the free response question.
    
    Create an Evaluation Metric:
    Generate an evaluation metric suitable for evaluating a 4th grader's response to the free response question about ${topic}. The evaluation metric should align with the sub-points of the writing standard.
    `;
    
    // Send the prompt to GPT for further processing
    const response = await chatgpt(prompt);
    console.log(response);
    console.log("\nPlease answer the above free response question:");
    askQuestion()
};

const askQuestion = () => {
    rl.question('\nYou: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
            rl.close();
            return;
        }

        // If studentInterestTopic is null, this is the first input from the user
        if (!studentInterestTopic) {
            studentInterestTopic = input;
            console.log(`\nGot it! You're interested in ${studentInterestTopic}. Let's dive in!`);
            await generateFRQ(studentInterestTopic); // Generate FRQ based on the topic
        } else {
            const evaluation = await chatgpt(input);
            console.log(`${evaluation}`);
        }
    });
};

console.log("Hello young scholar! 🌟 I'm EduGenAI, your friendly study buddy. My main goal is to help you study better and make learning fun! 📚✨ What topic are you interested in today? It could be anything like \"dinosaurs\", \"planets\", or \"history tales\". Just let me know, and we'll dive right in!");
console.log("\nType 'exit' to end the conversation.");
askQuestion();
