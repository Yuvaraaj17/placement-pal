import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { RefreshToken } from '../../models/RefreshToken';
import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' });
  }

  // 1. Generate Tokens
  const accessToken = jwt.sign({ id: user._id }, process.env.NUXT_JWT_ACCESS_SECRET as string, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.NUXT_JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

  // 2. Save Refresh Token to MongoDB
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  setCookie(event, 'access_token', accessToken, {
    secure: true,
    sameSite: 'lax',
    maxAge: 15 * 60 // 15 minutes
  });

  // 3. Set Refresh Cookie (Long lived)
  setCookie(event, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh', // Security: Only sent to the refresh endpoint
    maxAge: 7 * 24 * 60 * 60 
  });

  return { statusCode: 200, message: 'Logged In !!!' };
});