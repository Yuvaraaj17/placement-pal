import { connectDB } from '../utils/db'

export default defineNitroPlugin(async () => {
  try {
    await connectDB()
    console.log('✅ MongoDB is ready for all API routes')
  } catch (e) {
    console.error('❌ MongoDB initialization failed', e)
  }
})
