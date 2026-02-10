export default defineEventHandler(async () => {
    const data = await Skill.find()

    if(data && data.length)
        return { statusCode : 200 , message: 'Skills fetched succesfully', data: data}
})