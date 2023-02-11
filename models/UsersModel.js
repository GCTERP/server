import mongoose from "mongoose"

const { Schema, model } = mongoose

const UsersSchema = new Schema({
    
    email: { type: String, required: true, unique: true },

    personalEmail: { type: String, required: true },

    userType: { type: String, required: true },

    password: { type: String }

}, { collection: "Users", timestamps: true })


export const UsersModel = model('Users', UsersSchema)