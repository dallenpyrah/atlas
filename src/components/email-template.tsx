interface EmailTemplateProps {
  firstName: string
  subject?: string
  message?: string
}

export function EmailTemplate({
  firstName,
  subject = 'Welcome',
  message = 'Thank you for joining us!',
}: EmailTemplateProps) {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        {subject}
      </h1>
      <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.5' }}>Hello {firstName},</p>
      <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.5' }}>{message}</p>
      <div
        style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #eee',
          fontSize: '14px',
          color: '#888',
        }}
      >
        <p>Best regards,</p>
        <p>Your Team</p>
      </div>
    </div>
  )
}

