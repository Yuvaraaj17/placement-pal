import { Schema, model } from 'mongoose'

const SkillSchema = new Schema(
  {
    skill_code: { type: String, required: true, unique: true, trim: true },
    skill_name: { type: String, required: true, trim: true },
    skill_status: { type: Boolean, default: true},
    skill_description: { type: String, default: ''}
  },
  { timestamps: true, collection: 'skills' },
)

export const Skill = model('Skill', SkillSchema)
