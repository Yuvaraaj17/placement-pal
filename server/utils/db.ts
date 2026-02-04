import mongoose from 'mongoose'

/**
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 */
export const connectDB = async () => {
  // If we are already connected, don't do anything
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  // If we are currently connecting, wait for that connection to finish
  if (mongoose.connection.readyState === 2) {
    console.log('⏳ Existing connection attempt in progress...')
    return
  }

  try {
    const uri = process.env.NUXT_MONGODB_CONNECTION
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env file')
    }

    // Set connection options for stability
    const opts = {
      bufferCommands: false, // Disable buffering to catch errors early
      maxPoolSize: 10, // Maintain up to 10 socket connections
    }

    const conn = await mongoose.connect(uri, opts)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (e) {
    console.error('❌ MongoDB Connection Error:', e)
    // Explicitly throw so the API route knows the DB is down
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Database Connection Error',
    })
  }
}
