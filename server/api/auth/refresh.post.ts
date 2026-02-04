import jwt from 'jsonwebtoken';
import { RefreshToken } from "~~/server/models/RefreshToken";

export default defineEventHandler(async (event) => {
  const tokenFromCookie = getCookie(event, 'auth_refresh_token');

  // Verify DB existence (Revocation Check)
  const dbToken = await RefreshToken.findOne({ token: tokenFromCookie });
  if (!dbToken) throw createError({ statusCode: 403, message: 'Token revoked or invalid' });

  try {
    const payload = jwt.verify(tokenFromCookie, process.env.JWT_REFRESH_SECRET);
    
    // Issue NEW Access Token
    const newAccessToken = jwt.sign({ id: payload.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    
    return { accessToken: newAccessToken };
  } catch (err) {
    throw createError({ statusCode: 403, message: 'Refresh session expired' });
  }
});