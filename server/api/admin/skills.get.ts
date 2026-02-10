export default defineEventHandler(async () => {
    const data = await Skill.find({skill_status: true})

    if(data && data.length)
        return { statusCode : 200 , message: 'Skills fetched succesfully', data: data}
})