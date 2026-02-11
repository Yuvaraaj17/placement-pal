import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { PasswordResetToken } from '~~/server/models/PasswordResetToken'
import { User } from '~~/server/models/User'

export default defineEventHandler(async (event) => {
  await connectDB()

  const { token, password } = await readBody(event)

  if (!token || typeof token !== 'string') {
    return { statusCode: 400, message: 'Reset token is required' }
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return { statusCode: 400, message: 'Password must be at least 6 characters' }
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const record = await PasswordResetToken.findOne({ tokenHash })

  if (!record) {
    return { statusCode: 400, message: 'Reset token is invalid or expired' }
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  await User.updateOne({ _id: record.userId }, { $set: { password: hashedPassword } })
  await PasswordResetToken.deleteMany({ userId: record.userId })

  return { statusCode: 200, message: 'Password updated successfully' }
})
