# Briefd MVP

A backend-only Next.js 14 API project to process webhooks, generate newsletters using the Anthropic API (Claude), and send emails using Resend.

## Project Structure

- `app/api/webhook/route.ts`: Main webhook endpoint to trigger the workflow.
- `lib/generateNewsletter.ts`: Utility using `@anthropic-ai/sdk` to generate newsletter content.
- `lib/sendEmail.ts`: Utility using `resend` to send the generated emails.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables. Add your keys to `.env.local`:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `RESEND_API_KEY`: Your Resend API key
   - `RESEND_FROM_EMAIL`: The verified email address you'll send from (e.g., `newsletter@yourdomain.com`)
   - `NEXT_PUBLIC_APP_URL`: The URL where your app is hosted

3. Run the development server:
   ```bash
   npm run dev
   ```

4. You can submit to the webhook locally by sending a POST request to `http://localhost:3000/api/webhook`.
