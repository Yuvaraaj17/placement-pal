import crypto from 'crypto'
import { PasswordResetToken } from '~~/server/models/PasswordResetToken'
import { User } from '~~/server/models/User'
import { sendMail } from '~~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  await connectDB()

  const { email } = await readBody(event)

  if (!email || typeof email !== 'string') {
    return { statusCode: 400, message: 'Email is required' }
  }

  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ email: normalizedEmail })

  if (!user) {
    return {
      statusCode: 200,
      message: 'If an account exists for this email, you will receive a reset link.',
    }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await PasswordResetToken.deleteMany({ userId: user._id })
  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,
  })

  const appUrl = useRuntimeConfig().public.appUrl
  const resetUrl = `${appUrl}/reset_password?token=${token}`

  await sendMail({
    to: normalizedEmail,
    subject: 'Reset your Placement Pal password',
    text: `Reset your password: ${resetUrl}`,
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
    `,
  })

  return {
    statusCode: 200,
    message: 'If an account exists for this email, you will receive a reset link.',
  }
})
