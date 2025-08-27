const mailgun = require('mailgun-js')

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
})

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
  
  const data = {
    from: process.env.EMAIL_FROM || 'noreply@jamqueuepro.com',
    to: email,
    subject: 'Verify Your Email - Jam Queue Pro',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb;">Jam Queue Pro</h1>
        </div>
        
        <h2>Welcome to Jam Queue Pro!</h2>
        <p>Thank you for signing up. To complete your registration, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
        
        <p>This verification link will expire in 24 hours.</p>
      </div>
    `
  }

  try {
    const body = await mg.messages().send(data)
    console.log('Email sent successfully:', body)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
