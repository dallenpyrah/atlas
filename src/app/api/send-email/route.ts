import { type NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { EmailTemplate } from '@/components/email-template'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { to, firstName, subject, message, from } = body

    if (!to || !firstName) {
      return NextResponse.json(
        { error: 'Missing required fields: to and firstName are required' },
        { status: 400 },
      )
    }

    const { data, error } = await resend.emails.send({
      from: from || 'Acme <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject: subject || 'Hello from Resend',
      react: EmailTemplate({ firstName, subject, message }),
    })

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

