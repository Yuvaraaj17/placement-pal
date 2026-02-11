import { Schema, model } from 'mongoose'

const ResumeSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    title: { type: String, default: '' },
    content: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, collection: 'resumes' },
)

export const Resume = model('Resume', ResumeSchema)
