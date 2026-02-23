import { getPrompt } from './lib/generateNewsletter';
import { UserPreferences } from './app/api/webhook/route';

const mockPreferences: UserPreferences = {
    firstName: 'Rob',
    email: 'robgif1@gmail.com',
    topics: ['Global Headlines', 'Finance & Markets', 'AI & Tech', 'Sport'],
    location: 'New York',
    sportTeam: 'Arsenal',
    cadence: 'Once a week — Sunday morning'
};

const { system, user } = getPrompt(mockPreferences);

console.log(system);
console.log('\n====================================\n=== USER PROMPT ===\n====================================\n');
console.log(user);
