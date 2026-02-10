import { Types } from 'mongoose'

export default defineEventHandler(async (event) => {
  await connectDB()

  try {
    const {
      skill_id,
      skill_name,
      skill_description,
      skill_status,
      linked_sub_skill_ids = null,
      link_sub_skill_ids = [],
      unlink_sub_skill_ids = [],
    } = await readBody(event)

    if (!skill_id) {
      return { statusCode: 400, message: 'Skill id is required' }
    }

    const normalizedSkillId = Types.ObjectId.isValid(skill_id)
      ? new Types.ObjectId(skill_id)
      : null

    if (!normalizedSkillId) {
      return { statusCode: 400, message: 'Invalid skill id' }
    }

    const updatePayload: Record<string, unknown> = {}
    if (typeof skill_name === 'string') {
      updatePayload.skill_name = skill_name.trim()
    }
    if (typeof skill_description === 'string') {
      updatePayload.skill_description = skill_description
    }
    if (typeof skill_status === 'boolean') {
      updatePayload.skill_status = skill_status
    } else if (skill_status === 'true' || skill_status === 'false') {
      updatePayload.skill_status = skill_status === 'true'
    }

    if (Object.keys(updatePayload).length) {
      await Skill.updateOne({ _id: normalizedSkillId }, { $set: updatePayload })
    }

    const toObjectIds = (value: unknown) => {
      if (!Array.isArray(value)) return []
      return value
        .filter((id) => id && id !== 'null' && Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id))
    }

    let unlinkIds = toObjectIds(unlink_sub_skill_ids)
    let linkIds = toObjectIds(link_sub_skill_ids)

    if (Array.isArray(linked_sub_skill_ids)) {
      const desiredIds = toObjectIds(linked_sub_skill_ids)
      const desiredSet = new Set(desiredIds.map((id) => String(id)))
      const currentLinked = await SubSkill.find({ skill_id: normalizedSkillId })
        .select('_id')
        .lean()
      const currentSet = new Set(currentLinked.map((item) => String(item._id)))

      linkIds = desiredIds.filter((id) => !currentSet.has(String(id)))
      unlinkIds = currentLinked
        .filter((item) => !desiredSet.has(String(item._id)))
        .map((item) => item._id)
    }

    if (unlinkIds.length) {
      await SubSkill.updateMany(
        { _id: { $in: unlinkIds }, skill_id: normalizedSkillId },
        { $set: { skill_id: null } },
      )
      await Question.updateMany(
        { sub_skill_id: { $in: unlinkIds } },
        { $set: { skill_id: null } },
      )
    }

    if (linkIds.length) {
      await SubSkill.updateMany(
        { _id: { $in: linkIds } },
        { $set: { skill_id: normalizedSkillId } },
      )
      await Question.updateMany(
        { sub_skill_id: { $in: linkIds } },
        { $set: { skill_id: normalizedSkillId } },
      )
    }

    return { statusCode: 200, message: 'Skill updated successfully' }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { statusCode: 500, message: err.message }
    }
  }
})
