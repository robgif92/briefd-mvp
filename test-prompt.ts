import { generateNewsletter, getPrompt } from './lib/generateNewsletter';
import { UserPreferences } from './app/api/webhook/route';

const mockPreferences: UserPreferences = {
    firstName: "Rob",
    email: "robgif1@gmail.com",
    topics: ["Global Headlines", "Finance & Markets", "AI & Tech", "Sport"],
    location: "New York",
    sportTeam: "Arsenal"
};

async function test() {
    console.log("--- Generating Prompt ---");
    const { system, user } = getPrompt(mockPreferences);
    console.log("SYSTEM PROMPT:", system);
    console.log("\nUSER PROMPT:", user);

    console.log("\n--- Calling Perplexity API ---");
    console.log("This will use the PERPLEXITY_API_KEY from your .env.local\n");

    try {
        const html = await generateNewsletter(mockPreferences);
        console.log("--- SUCCESS! Newsletter Generated ---");
        console.log(html.substring(0, 500) + "..."); // Print snippet
        console.log("\nFull HTML length:", html.length);
    } catch (err) {
        console.error("--- ERROR ---");
        console.error(err);
    }
}

test();
