import bcrypt from 'bcryptjs'
import { User } from '~~/server/models/User'

export default defineEventHandler(async (event) => {
  const { password, user_id } = await readBody(event)

  // 1. Validation
  const existingUser = await User.findOne({ user_id })
  if (existingUser) {
    return { statusCode: 400, message: 'Email already in use' }
  }

  // 2. Hashing
  const hashedPassword = await bcrypt.hash(password, 12)

  // 3. Database Persistence
  await User.create({
    password: hashedPassword,
    user_id: user_id,
  })

  return { statusCode: 200, message: 'Account created! Please log in.' }
})
