import { RefreshToken } from '~~/server/models/RefreshToken';

export default defineEventHandler(async (event) => {
  // 1. Get the refresh token from the cookie before we delete it
  const refreshToken = getCookie(event, 'refresh_token');

  // 2. Remove the token from MongoDB so it can never be used again
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  // 3. Instruct the browser to delete the cookies
  // We do this by setting the cookie with a maxAge of 0 (immediate expiration)
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/', // Ensure we target the correct path
  };

  deleteCookie(event, 'access_token', cookieOptions);
  deleteCookie(event, 'refresh_token', { ...cookieOptions, path: '/api/auth' });

  return { statusCode: 200,message: 'Logged out successfully' };
});