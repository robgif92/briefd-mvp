import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
    toEmail: string,
    firstName: string,
    htmlContent: string
): Promise<void> {
    try {
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const subject = `Your Weekly Briefd ☕ — ${dateStr}`;

        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: toEmail,
            subject: subject,
            html: htmlContent,
            text: 'Your personalised Briefd newsletter is ready. Please view this email in an HTML-compatible email client.'
        });

        if (error) {
            throw new Error(`Resend error: ${error.message}`);
        }

        console.log(`Newsletter sent successfully to ${toEmail}`, data);
    } catch (error) {
        console.error(`Failed to send email to ${toEmail}:`, error);
        throw error;
    }
}
