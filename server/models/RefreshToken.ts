import { Schema, model } from 'mongoose';

const RefreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true }, // Store a unique UUID or a hashed JWT
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// Auto-delete document when it expires
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model('RefreshToken', RefreshTokenSchema);