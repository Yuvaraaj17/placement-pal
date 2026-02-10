import { Types } from 'mongoose'

export default defineEventHandler(async (event) => {
  await connectDB()

  try {
    const { sub_skill_id, sub_skill_name, sub_skill_description, skill_id, sub_skill_status } =
      await readBody(event)

    if (!sub_skill_id || !Types.ObjectId.isValid(sub_skill_id)) {
      return { statusCode: 400, message: 'Sub skill id is required' }
    }

    const normalizedSubSkillId = new Types.ObjectId(sub_skill_id)

    let normalizedSkillId: Types.ObjectId | null = null
    if (skill_id && skill_id !== 'null') {
      if (!Types.ObjectId.isValid(skill_id)) {
        return { statusCode: 400, message: 'Invalid skill id' }
      }
      normalizedSkillId = new Types.ObjectId(skill_id)
    }

    const updatePayload: Record<string, unknown> = {}
    if (typeof sub_skill_name === 'string') {
      updatePayload.sub_skill_name = sub_skill_name.trim()
    }
    if (typeof sub_skill_description === 'string') {
      updatePayload.sub_skill_description = sub_skill_description
    }
    if (typeof sub_skill_status === 'boolean') {
      updatePayload.sub_skill_status = sub_skill_status
    } else if (sub_skill_status === 'true' || sub_skill_status === 'false') {
      updatePayload.sub_skill_status = sub_skill_status === 'true'
    }
    updatePayload.skill_id = normalizedSkillId

    await SubSkill.updateOne({ _id: normalizedSubSkillId }, { $set: updatePayload })
    await Question.updateMany(
      { sub_skill_id: normalizedSubSkillId },
      { $set: { skill_id: normalizedSkillId } },
    )

    return { statusCode: 200, message: 'Sub skill updated successfully' }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { statusCode: 500, message: err.message }
    }
  }
})
