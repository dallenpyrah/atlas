# Resend Email Setup

This Next.js application is configured to send emails using Resend.

## Setup Instructions

1. **Get your Resend API Key**
   - Sign up at [Resend.com](https://resend.com)
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key (it won't be shown again)

2. **Configure Environment Variable**
   - Open `.env.local` file
   - Replace `re_YOUR_API_KEY_HERE` with your actual Resend API key:
     ```
     RESEND_API_KEY=re_actualKeyHere
     ```

3. **Verify Domain (Production)**
   - In Resend dashboard, add your domain
   - Add the DNS records to your domain provider
   - Wait for verification (usually takes a few minutes)
   - Once verified, update the `from` email in your code

## Usage

### Using the API Route

Send a POST request to `/api/send-email` with the following JSON body:

```javascript
{
  "to": "recipient@example.com",
  "firstName": "John",
  "subject": "Welcome!", // optional
  "message": "Custom message here", // optional
  "from": "sender@yourdomain.com" // optional, defaults to Resend test email
}
```

### Using the Client-Side Helper

```javascript
import { sendEmail } from '@/lib/resend'

await sendEmail({
  to: 'recipient@example.com',
  firstName: 'John',
  subject: 'Welcome!',
  message: 'Thank you for signing up!'
})
```

## Files Created

- `/src/app/api/send-email/route.ts` - API endpoint for sending emails
- `/src/components/email-template.tsx` - Email template component
- `/src/lib/resend.ts` - Utility functions for email sending
- `/.env.local` - Environment variables (not tracked in git)

## Testing

For development, Resend provides a test email address (`onboarding@resend.dev`) that you can use as the sender without domain verification.

## Important Notes

- The API key should never be committed to version control
- For production, always verify your domain for better deliverability
- Rate limits apply based on your Resend plan