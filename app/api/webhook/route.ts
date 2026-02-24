import { NextResponse } from 'next/server';
import { generateNewsletter } from '@/lib/generateNewsletter';
import { sendEmail } from '@/lib/sendEmail';
import { supabase } from '@/lib/supabase';

export const maxDuration = 300;

export interface UserPreferences {
    firstName: string;
    email: string;
    topics: string[];
    location: string;
    sportTeam: string;
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
            sportTeam
        };

        console.log('Final Preferences Object:', JSON.stringify(preferences, null, 2));

        // 1. Save to Database (Upsert based on email)
        const { data: existingUser, error: fetchError } = await supabase
            .from('subscriptions')
            .select('last_sent')
            .eq('email', email)
            .single();

        const { error: upsertError } = await supabase
            .from('subscriptions')
            .upsert({
                email,
                first_name: firstName,
                topics,
                location,
                sport_team: sportTeam,
                updated_at: new Date().toISOString()
            });

        if (upsertError) throw upsertError;

        // 2. Decide if we send an immediate "Welcome" email
        // We send it if the user is new OR if they've never been sent one
        const shouldSendWelcome = !existingUser || !existingUser.last_sent;

        if (shouldSendWelcome) {
            console.log(`New subscriber detected (${email}). Generating immediate welcome newsletter...`);

            const newsletterHtml = await generateNewsletter(preferences);
            await sendEmail(email, firstName, newsletterHtml);

            // Update last_sent timestamp
            await supabase
                .from('subscriptions')
                .update({ last_sent: new Date().toISOString() })
                .eq('email', email);

            return NextResponse.json({ success: true, message: 'Welcome email sent and user subscribed' });
        }

        return NextResponse.json({ success: true, message: 'Subscription updated' });

    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: "Briefd webhook is live" });
}
