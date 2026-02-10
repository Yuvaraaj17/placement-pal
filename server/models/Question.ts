import { Schema, model } from 'mongoose'

const QuestionSchema = new Schema(
  {
    question_text: { type: String, required: true, trim: true },
    skill_id: { type: Schema.Types.ObjectId, ref: 'Skill', required: true, index: true },
    sub_skill_id: { type: Schema.Types.ObjectId, ref: 'SubSkill', required: true, index: true },
  },
  { timestamps: true, collection: 'questions' },
)

export const Question = model('Question', QuestionSchema)
