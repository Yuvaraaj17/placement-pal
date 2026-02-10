export default defineEventHandler(async () => {
  await connectDB()

  try {
    const data = await SubSkill.find({})
      .select('_id sub_skill_name sub_skill_code sub_skill_description sub_skill_status skill_id')
      .sort({ sub_skill_name: 1 })

    return { statusCode: 200, message: 'Sub skills fetched successfully', data }
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { statusCode: 500, message: err.message }
    }
  }
})
