import { sendMail } from '~~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const to = body?.to || process.env.GMAIL_USER

    if (!to || typeof to !== 'string') {
      return { statusCode: 400, message: 'Recipient email is required' }
    }

    const subject =
      typeof body?.subject === 'string' && body.subject.trim()
        ? body.subject.trim()
        : 'Placement Pal test email'

    const text =
      typeof body?.text === 'string' && body.text.trim()
        ? body.text
        : 'This is a test email from Placement Pal.'

    await sendMail({
      to,
      subject,
      text,
      html: `<p>${text}</p>`,
    })

    return { statusCode: 200, message: `Test email sent to ${to}` }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { statusCode: 500, message: err.message }
    }
    return { statusCode: 500, message: 'Failed to send test email' }
  }
})
