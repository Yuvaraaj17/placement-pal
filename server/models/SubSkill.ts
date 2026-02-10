import { Schema, model } from 'mongoose'

const SubSkillSchema = new Schema(
  {
    skill_id: { type: Schema.Types.ObjectId, ref: 'Skill', required: false, index: true },
    sub_skill_code: { type: String, required: true, trim: true },
    sub_skill_name: { type: String, required: true, trim: true },
    sub_skill_status: { type: Boolean, default: true },
    sub_skill_description: { type: String, default: ''}
  },
  { timestamps: true, collection: 'subskills' },
)

// Prevent duplicate sub-skill codes within the same skill (only when skill_id is present)
SubSkillSchema.index(
  { skill_id: 1, sub_skill_code: 1 },
  { unique: true, partialFilterExpression: { skill_id: { $exists: true, $ne: null } } },
)

export const SubSkill = model('SubSkill', SubSkillSchema)
