import mongoose from "mongoose"

export default defineEventHandler(async ()=> {

    const db = mongoose.connection.db
    return db!.collection("users").find().toArray();
})