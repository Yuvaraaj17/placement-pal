export default defineEventHandler(async () => {
    await connectDB()
    const data = await Skill.find({})
        .select('_id skill_name skill_code skill_description skill_status')
        .sort({ skill_name: 1 })
        .lean()

    return { statusCode : 200 , message: 'Skills fetched succesfully', data: data || [] }
})
