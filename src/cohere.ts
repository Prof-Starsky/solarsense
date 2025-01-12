import { CohereClientV2 } from 'cohere-ai';

const API_KEY: string = "zLeAodVVy5MSQ5Q8b2yPQM7D0GcKvnq3kbdKChy8";

const cohere = new CohereClientV2({
    token: API_KEY
});

export async function chatWithCohere(message: string): Promise<string> {
    const stream = await cohere.chat({
        model: 'command-r7b-12-2024',
        messages: [
            {
                role: 'system',
                content: 'You are a helpful, friendly, and informative chatbot trained in only repeating FACTUAL information about solar panels and their installation.'
            },
            {
                role: 'user',
                content: message
            }
        ]
    });

    console.log(stream.message.content[0].text);

    return stream.message.content[0].text;
}

// Example usage:
// (async () => {
//     const response = await chatWithCohere("What are the benefits of solar panels?");
//     console.log(response);
// })();
