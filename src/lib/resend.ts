import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailParams {
  to: string | string[]
  subject: string
  firstName: string
  message?: string
  from?: string
}

export async function sendEmail({
  to,
  subject,
  firstName,
  message,
  from = 'Acme <onboarding@resend.dev>',
}: SendEmailParams) {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      subject,
      firstName,
      message,
      from,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send email')
  }

  return await response.json()
}
