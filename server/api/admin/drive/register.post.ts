import { Drive } from '~~/server/models/Drive'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    await Drive.insertOne(body)
  } catch (err) {
    if (err instanceof Error) return { statusCode: 500, message: 'Internal error' + err.message }
  }

  return { statusCode: 200, message: 'Registered Drive Successfully' }
})
