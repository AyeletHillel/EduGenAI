import dotenv from 'dotenv';
import readline from 'readline';
import chatgpt from './chatgpt.js';
import standards from './standards.json' assert { type: 'json' }; 

const textTypes = standards["Text Types and Purposes"];

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('close', () => {
    console.log("\nGoodbye! Thanks for using EduGenAI. 🌟");
    process.exit(0); // Exit the process gracefully
});

let studentInterestTopic = null; // Variable to store the Student Interest Topic
let isAnsweringFRQ = false; // Flag to check if the user is answering the Free Response Question
let evaluationMetrics = null; // Variable to store the evaluation metrics

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
    Generate a brief context about ${topic} to help a 4th grader understand the basics before they answer the free response question.`;

    const prompt2 = `
    
    Create an Evaluation Metric:
    Generate an evaluation metric suitable for evaluating a 4th grader's response to the free response question about ${topic}. The evaluation metric should align with the sub-points of the writing standard.

    Writing standard: description: ${description}, instructions: ${instructions}`;
    
    evaluationMetrics = await chatgpt(prompt2); // Store the metrics for later use
    const response = await chatgpt(prompt);
    console.log(`\n${response}`);
    console.log("\nPlease answer the above free response question:");
    isAnsweringFRQ = true;
};

const qualityCheck = async (feedback) => {

    const prompt = `Please evaluate the feedback provided by a teacher on a 4th-grade student's writing assignment. Consider if the feedback is clear, relevant, and constructive for a 4th grader. If the feedback seems appropriate, return "pass". If not, return "fail". Feedback: ${feedback}`

    const response = await chatgpt(prompt);
    return response;
};

const evaluateResponse = async (response) => {
    let feedback;
    let attempts = 0;
    const maxAttempts = 10;

    do {
        const prompt = `You are an AI-powered educational assistant designed to evaluate 4th-grade students free response questions. 
        Your task is to evaluate the student's response based on the following evaluation metrics: ${evaluationMetrics}. 
        Student's answer: ${response}`;

        feedback = await chatgpt(prompt);
        const qualityCheckResult = await qualityCheck(feedback);

        if (qualityCheckResult === "pass") {
            console.log(`${feedback}`);
            rl.close();
            return;  
        }

        attempts++;
    } while (attempts < maxAttempts);

    if (attempts === maxAttempts) {
        console.log(`\nWe are having some difficulty providing feedback at the moment...`); // Feedback didn't pass
        rl.close();
    } else {
        askQuestion();  
    }
};


const askQuestion = () => {
    rl.question('\nYou: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
            rl.close();
            return;
        }

        if (!studentInterestTopic) {
            studentInterestTopic = input;
            console.log(`\nGot it! You're interested in ${studentInterestTopic}. Let's dive in!`);
            await generateFRQ(studentInterestTopic);
            isAnsweringFRQ = true; // Set the flag to true after generating the FRQ
            askQuestion(); 
        } else if (isAnsweringFRQ) {
            const studentResponse = input; // Store the user's response to the FRQ
            await evaluateResponse(studentResponse); 
            isAnsweringFRQ = false; // Reset the flag after evaluating the answer
            askQuestion(); 
        } else {
            const response = await chatgpt(input);
            console.log(`${response}`);
            askQuestion(); 
        }
    });
};


console.log("Hello young scholar! 🌟 I'm EduGenAI, your friendly study buddy. My main goal is to help you study better and make learning fun! 📚✨ What topic are you interested in today? It could be anything like \"dinosaurs\", \"planets\", or \"history tales\". Just let me know, and we'll dive right in!");
console.log("\nType 'exit' to end the conversation.");
askQuestion();
