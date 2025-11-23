require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function main() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env.local");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log(`Checking models...`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            fs.writeFileSync('models.txt', "API Error: " + JSON.stringify(data, null, 2));
        } else {
            if (data.models) {
                const names = data.models.map(m => m.name);
                fs.writeFileSync('models.txt', names.join('\n'));
                console.log("Wrote models to models.txt");
            } else {
                fs.writeFileSync('models.txt', "No models found: " + JSON.stringify(data));
            }
        }

    } catch (error) {
        fs.writeFileSync('models.txt', "Network Error: " + error.message);
    }
}

main();
