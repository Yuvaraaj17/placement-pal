import { getEligibleStudents } from '~~/server/utils/students'

export default defineEventHandler(async (event) => {
  await connectDB()

  const { required_cgpa, departments } = await readBody(event)

  const selectedDepts = Object.keys(departments)
    .filter((key) => departments[key] === true)
    .map((dept) => dept.toUpperCase())

  const eligibleStudents = await getEligibleStudents({
    cgpa: Number(required_cgpa),
    departments: selectedDepts,
  })

  return { statusCode: 200, message: 'Fetched Eligible Students', data: eligibleStudents }
})
