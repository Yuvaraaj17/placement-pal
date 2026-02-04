import bcrypt from 'bcryptjs';
import { User } from '~~/server/models/User';

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  // 1. Validation
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError({ statusCode: 400, message: 'Email already in use' });
  }

  // 2. Hashing
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. Database Persistence
  await User.create({
    email,
    password: hashedPassword
  });

  return { statusCode: 200, message: 'Account created! Please log in.' };
});