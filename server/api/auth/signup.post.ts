import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { EmailVerificationToken } from '~~/server/models/EmailVerificationToken'
import { User } from '~~/server/models/User'
import { sendMail } from '~~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  await connectDB()
  const { password, user_id, email } = await readBody(event)

  if (!email || typeof email !== 'string') {
    return { statusCode: 400, message: 'Email is required' }
  }

  const normalizedEmail = email.trim().toLowerCase()

  // 1. Validation
  const existingUserId = await User.findOne({ user_id })
  if (existingUserId) {
    return { statusCode: 400, message: 'User ID already in use' }
  }

  const existingEmail = await User.findOne({ email: normalizedEmail })
  if (existingEmail) {
    return { statusCode: 400, message: 'Email already in use' }
  }

  // 2. Hashing
  const hashedPassword = await bcrypt.hash(password, 12)

  // 3. Database Persistence
  const user = await User.create({
    password: hashedPassword,
    user_id: user_id,
    email: normalizedEmail,
    email_verified: false,
  })

  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await EmailVerificationToken.deleteMany({ userId: user._id })
  await EmailVerificationToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,
  })

  const appUrl = useRuntimeConfig().public.appUrl
  const verifyUrl = `${appUrl}/verify_email?token=${token}`

  await sendMail({
    to: normalizedEmail,
    subject: 'Verify your Placement Pal account',
    text: `Welcome to Placement Pal. Verify your email: ${verifyUrl}`,
    html: `
      <p>Welcome to Placement Pal.</p>
      <p>Verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
    `,
  })

  return { statusCode: 200, message: 'Account created! Check your email to verify.' }
})
