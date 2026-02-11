import crypto from 'crypto'
import { EmailVerificationToken } from '~~/server/models/EmailVerificationToken'
import { User } from '~~/server/models/User'

export default defineEventHandler(async (event) => {
  await connectDB()

  const body = await readBody(event)
  const token = body?.token || getQuery(event)?.token

  if (!token || typeof token !== 'string') {
    return { statusCode: 400, message: 'Verification token is required' }
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const record = await EmailVerificationToken.findOne({ tokenHash })

  if (!record) {
    return { statusCode: 400, message: 'Verification token is invalid or expired' }
  }

  await User.updateOne({ _id: record.userId }, { $set: { email_verified: true } })
  await EmailVerificationToken.deleteMany({ userId: record.userId })

  return { statusCode: 200, message: 'Email verified successfully' }
})
