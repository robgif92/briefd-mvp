import Anthropic from '@anthropic-ai/sdk';
import { UserPreferences } from '../app/api/webhook/route';

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultHeaders: {
        "anthropic-beta": "web-search-2025-03-05"
    }
});

export function getPrompt(preferences: UserPreferences): { system: string, user: string } {
    const today = new Date();
    const todayDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const fromDate = sevenDaysAgo.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const topicsList = preferences.topics.join(", ");

    const system = `Never narrate your process, never say what you are about to do, never output anything except the final HTML newsletter. Your entire response must be only the completed HTML email body. You are an expert newsletter curator for Briefd. You have access to web search — use it before writing every single section. Always search for the most recent news, scores, market data, and headlines from the past 7 days before writing. Never rely on training data for anything time-sensitive. Today's date is ${todayDate}. Only cover events that happened between ${fromDate} and ${todayDate}.`;

    const user = `Today is ${todayDate}. Create a personalised HTML email newsletter for ${preferences.firstName} covering news and events from the past 7 days only (${fromDate} to ${todayDate}).
IMPORTANT INSTRUCTIONS FOR LINKS:

For every major story, search for the actual article and include a real working source link
Format links like this inline: <a href="URL" style="color:#3b5bdb; text-decoration:none;">Read more →</a>
Only include links from real search results — never invent or guess a URL
Include at least one source link per section
For market data: link to Yahoo Finance, Bloomberg or CNBC
For sports: link to BBC Sport, ESPN or the official league site
For AI news: link to the official company blog or TechCrunch
For global headlines: link to Reuters, BBC News or AP News

PERSONALISATION:

Name: ${preferences.firstName}
Location: ${preferences.location}
Sport team: ${preferences.sportTeam}
Topics selected: ${topicsList}

OUTPUT FORMAT:
Return ONLY the HTML body content (no DOCTYPE, no html tag, no head tag).
Use inline CSS throughout. Max container width 660px, centered, white background, border-radius 10px, box-shadow 0 2px 18px rgba(0,0,0,0.09).
IMPORTANT: Never use HTML tables anywhere in the newsletter. Use simple styled divs for all layouts including fixtures, market data, and weather cards. Tables break in email clients.
HEADER: Dark navy background (#0f1c3f), white text, show "${preferences.firstName}'s Weekly Briefd ☕"
GREETING: Hey ${preferences.firstName}, here's your personalised Briefd — covering everything that mattered from ${fromDate} to ${todayDate}.

SECTIONS — only include sections matching the selected topics:
If topics includes "Global Headlines":
<h2>🌍 Top Global Headlines</h2>
Numbered list of 5–7 major world/politics/geopolitics stories from the last 7 days. One factual sentence per story, optional witty one-liner if natural.

If topics includes "Finance & Markets":
<h2>📈 Finance & Markets</h2>
Part A — Market Snapshot:Search right now for the latest weekly closing prices for: S&P 500, Nasdaq, Dow Jones, 10-year Treasury yield, Gold (/oz), WTI Oil (/barrel), and Bitcoin (USD). Display these as a row of compact styled div cards (flex-wrapped, 2 rows of 4). Each card shows: asset name, price/level, and week-over-week % change with a green ▲ or red ▼ arrow. CRITICAL RULE: Only populate cards with figures you have explicitly confirmed via web search in this session. If a figure cannot be confirmed from search results, omit that card entirely — do not show it, do not write "unconfirmed", just skip it. If no figures can be confirmed at all, skip Part A entirely and show nothing. Never use training data for any financial figures. If cards are shown, link the section heading to https://finance.yahoo.com.
Part B — What Moved Markets This Week:
Search for what drove US equity markets over the past 7 days. Write a concise 3–5 sentence narrative summary of the key themes, catalysts, and sentiment — macro surprises, Fed commentary, earnings reactions, geopolitical factors, or sector moves. This should read like a smart analyst's weekly wrap. Link to CNBC or Bloomberg for the source.
Part C — Week Ahead:
Search for the coming week's key events. Include: key data releases with exact dates (label each with the country, e.g. "In the US..." or "In the UK..."), Fed speakers, 3 earnings to watch, and any wildcards. For every data point or release, include the date in brackets, e.g. "PCE inflation print [Fri Feb 27]". Link to an earnings calendar or economic calendar source.

If topics includes "AI & Tech":
<h2>🤖 AI Pulse</h2>
3 punchy bullet points — no more. Each should be one to two sentences max. Label the company in bold brackets like [ANTHROPIC]. For each bullet, include the date of the news in brackets at the start, e.g. [Feb 19]. Focus only on the biggest, most significant AI developments from the past 7 days. No filler. Source each bullet with a real link.

If topics includes "Health & Fitness":
<h2>💪 Health & Fitness</h2>
3–4 short updates on health research, wearables, fitness trends, longevity news.

If topics includes "Sport":
<h2>🏀 Sport</h2>
If sportTeam is not "none": lead with that team's results, current record and standing, and next 3 fixtures. Then 2–3 other major sports stories from the past week relevant to the sport or the user's location.

If topics includes "Entertainment & Culture":
<h2>🎬 Entertainment & Culture</h2>
3–4 updates on new releases, box office, streaming, cultural moments.

If topics includes "Food & Restaurants":
<h2>🍽️ Food & Restaurants</h2>
3–4 items on openings, closures, food trends, chef news — focused on ${preferences.location} where possible.

If topics includes "Travel":
<h2>✈️ Travel</h2>
3–4 items on new routes, hotel openings, destination trends, travel deals.

ALWAYS ADD THESE SECTIONS AT THE END:
WEATHER SECTION — mandatory, never skip:
Search for the current 5-day weather forecast for ${preferences.location} right now using web search.
Return it as 5 inline div cards in a flex container. Each card must show: day name, weather emoji, high temperature in Fahrenheit, condition, and precipitation % if available. Use real searched data only.
<div style='display:flex; flex-wrap:wrap; gap:8px; margin:10px 0;'>
  <div style='background:#f0f4ff; border-radius:8px; padding:10px 14px; font-family:Arial,sans-serif; text-align:center; min-width:80px;'>
    <div style='font-weight:bold; font-size:12px;'>MON</div>
    <div style='font-size:20px;'>⛅</div>
    <div style='font-size:16px; color:#3b5bdb; font-weight:bold;'>52°F</div>
    <div style='font-size:11px; color:#555;'>Partly cloudy</div>
  </div>
</div>
Replace the example card with real searched data for each of the 5 days.

MEME OF THE WEEK:
Search for the single most viral or widely shared meme image from the past 7 days. Find a real, publicly accessible image URL (e.g. from Know Your Meme, Reddit, or a news article). Render it as a dark card (#111827 background, border-radius 10px, padding 16px) with the image displayed full-width (max-width:100%, border-radius:8px) and a single short caption line underneath in white text (font-size 13px, color #d1d5db). Keep it to image + one caption line only — no long descriptions, no paragraphs. CRITICAL RULE: If no reliable, publicly accessible image URL is found in search results, skip this section entirely — do not render the card, do not use a placeholder, do not describe the meme in text. Only render if a real image URL was returned by search.

CLOSE WITH:
<p style="margin-top:30px; font-family:Arial,sans-serif; font-size:14px; color:#444;">Catch you next week — stay curious! 🚀<br>Cheers,<br>The Briefd Team</p>

STYLING RULES — all CSS must be inline:

Font: Arial, sans-serif throughout
Section h2: color #0f1c3f, font-size 13px, uppercase, letter-spacing 1.2px, border-bottom 2px solid #e6eeff, padding-bottom 8px, font-family Arial
List items: font-size 14.5px, line-height 1.65, margin-bottom 10px
Body padding: 24px 36px
Container max-width: 660px`;

    return { system, user };
}

export async function generateNewsletter(preferences: UserPreferences): Promise<string> {
    try {
        const { system, user } = getPrompt(preferences);

        const message = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 12000,
            tools: [
                {
                    type: "web_search_20250305",
                    name: "web_search"
                }
            ],
            system: system,
            messages: [{
                role: 'user',
                content: user
            }]
        });

        const textBlocks = message.content.filter(block => block.type === 'text');
        if (textBlocks.length > 0) {
            const fullText = textBlocks
                .map(block => block.type === 'text' ? block.text : '')
                .join('')
            return fullText
        }

        throw new Error('No text response from Claude');

    } catch (error) {
        console.error('Claude API error:', error);
        throw error;
    }
}
