import { Counter } from "~~/server/models/Counter"

export default defineEventHandler(async (event) => {
    await connectDB()

    const { skill_id, sub_skill_name } = await readBody(event)

    const payload: Record<string, unknown> = {
        skill_id: skill_id ?? null,
        sub_skill_code : '',
        sub_skill_name : ''
    }

    try {
        // Keep null when no skill is selected
        payload.sub_skill_code = await formSubSkillCode();
        payload.sub_skill_name = sub_skill_name
        await SubSkill.insertOne(payload)
    } catch ( err : unknown) {
        if(err instanceof Error) {
            return { statusCode : 500, message: err.message}
        }
    }
  return { statusCode: 200, message: 'Skill Added' }
})

const formSubSkillCode = async ()=>{
    const res = await Counter.findOneAndUpdate(
    { _id: "sub_skill_code" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  
  return `SB_${String(res.seq).padStart(6, "0")}`; // SK_000001
}
