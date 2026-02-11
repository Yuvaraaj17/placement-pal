import { Schema, model } from 'mongoose'

const EmailVerificationTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: 'email_verification_tokens' },
)

EmailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const EmailVerificationToken = model(
  'EmailVerificationToken',
  EmailVerificationTokenSchema,
)
