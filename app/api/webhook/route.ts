import { NextResponse } from 'next/server';
import fs from 'fs';
import { generateNewsletter } from '@/lib/generateNewsletter';
import { sendEmail } from '@/lib/sendEmail';

export const maxDuration = 30;

export interface UserPreferences {
    firstName: string;
    email: string;
    topics: string[];
    location: string;
    sportTeam: string;
    cadence: string;
}

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        console.log('Incoming Tally Payload:', JSON.stringify(payload, null, 2));
        const fields = payload?.data?.fields || [];

        // Parse Tally.so fields with defaults
        let firstName = "your name";
        let email = "";
        let topics = ["Global Headlines"];
        let location = "your city";
        let sportTeam = "none";
        let cadence = "Weekly";

        for (const field of fields) {
            if (field.label === "First, what's your first name?") {
                firstName = field.value || firstName;
            }
            if (field.label === "And your email address?") {
                email = field.value || email;
            }
            if (field.label === "What do you want your Briefd to cover?") {
                topics = field.value || topics;
            }
            if (field.label === "Where are you based?") {
                location = field.value || location;
            }
            if (field.label === "Which sport team do you follow?") {
                sportTeam = field.value || sportTeam;
            }
            if (field.label === "How often do you want your Briefd?") {
                cadence = field.value || cadence;
            }
        }

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const preferences: UserPreferences = {
            firstName,
            email,
            topics,
            location,
            sportTeam,
            cadence
        };

        // Generate Newsletter based on user preferences
        const newsletterHtml = await generateNewsletter(preferences);

        // Preview Check
        const previewField = fields.find((f: any) => f.label === 'preview');
        const isPreview = previewField?.value === 'true';

        if (isPreview) {
            fs.writeFileSync('./preview.html', newsletterHtml);
            return NextResponse.json({
                success: true,
                mode: 'preview',
                message: 'preview.html saved — open it in your browser'
            });
        }

        // Send the Email
        await sendEmail(email, firstName, newsletterHtml);

        return NextResponse.json({ success: true, mode: 'sent' });

    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: "Briefd webhook is live" });
}
