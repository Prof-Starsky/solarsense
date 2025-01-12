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
                content: 'You are a concise person trained in only repeating FACTUAL information about solar panels and their installation. Respond with a short one line answer than include the numerical answer we are looking for. Give only one number in your answers. Get rid of all words like approximately'
            },
            {
                role: 'user',
                content: message
            }
        ]
    });

    //@ts-expect-error asd
    console.log(stream.message.content[0].text);

    //@ts-expect-error asd
    return stream.message.content[0].text;
}

// Example usage:
// (async () => {
//     const response = await chatWithCohere("What are the benefits of solar panels?");
//     console.log(response);
// })();
