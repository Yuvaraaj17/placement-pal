import { Counter } from "~~/server/models/Counter"

export default defineEventHandler(async (event) => {
    await connectDB()

    const { skill_name } = await readBody(event)

    const payload = {
        skill_code : '',
        skill_name : ''
    }

    try {
        payload.skill_code = await formSkillCode();
        payload.skill_name = skill_name
        await Skill.insertOne(payload)
    } catch ( err : unknown) {
        if(err instanceof Error) {
            return { statusCode : 500, message: err.message}
        }
    }
  return { statusCode: 200, message: 'Skill Added' }
})

const formSkillCode = async ()=>{
    const res = await Counter.findOneAndUpdate(
    { _id: "skill_code" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  
  return `SK_${String(res.seq).padStart(6, "0")}`; // SK_000001
}
