import { CohereClientV2 } from 'cohere-ai';

const API_KEY: string = "MXglJacSeIUEAqSc1Cp56yl62cmE4UwQXNiE2jmi";

// const API_LIST: Array<string> = [
//     "MXglJacSeIUEAqSc1Cp56yl62cmE4UwQXNiE2jmi"
//     // "NsEPajXraFiPuUL0JQ39dO6Yc0p6VbzTAc8gZa4I",

//     // "tjB3G8euaxhBNRtKNTKED0g7MlwniWGBkpaV0Zpn",
//     // "L9L55UvMeobWFY3VbWVRei7xQ60pPGEzKi5JiKLc"
// ];

// let x: number = 0;
// let API_KEY: string = API_LIST[0];

const cohere = new CohereClientV2({
    token: API_KEY
});

export async function chatWithCohere(message: string): Promise<string> {
    const stream = await cohere.chat({
        model: 'command-r-08-2024',
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
