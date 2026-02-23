import { NextResponse } from 'next/server';
import fs from 'fs';
import { generateNewsletter } from '@/lib/generateNewsletter';
import { sendEmail } from '@/lib/sendEmail';

export const maxDuration = 300;

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
            let val = field.value;

            // Resolve ID values to text labels for Multiple Choice fields
            if (field.type === 'MULTIPLE_CHOICE' && Array.isArray(val) && field.options) {
                val = val.map((id: string) => {
                    const option = field.options.find((opt: any) => opt.id === id);
                    return option ? option.text : id;
                });
            }

            if (field.label === "First Name") {
                firstName = (Array.isArray(val) ? val[0] : val) || firstName;
            }
            if (field.label === "Email") {
                email = (Array.isArray(val) ? val[0] : val) || email;
            }
            if (field.label === "Topics") {
                // Remove emojis and extra whitespace to match prompt logic
                topics = Array.isArray(val)
                    ? val.map((s: string) => s.replace(/[^\w\s&]/g, '').trim())
                    : [val];
            }
            if (field.label === "Location") {
                location = (Array.isArray(val) ? val[0] : val) || location;
            }
            if (field.label === "Sport Team") {
                sportTeam = (Array.isArray(val) ? val[0] : val) || sportTeam;
            }
            if (field.label === "Cadence") {
                cadence = (Array.isArray(val) ? val[0] : val) || cadence;
            }
        }

        if (!email) {
            console.error('No email found in payload. Processed fields:', { firstName, email, topics, location });
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

        console.log('Final Preferences Object:', JSON.stringify(preferences, null, 2));

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
