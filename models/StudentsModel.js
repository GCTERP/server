import mongoose from "mongoose"

const { Schema, model } = mongoose

const StudentsSchema = new Schema({
    
    register: { type: String, required: true, unique: true },

    regulation: { type: Number, required: true },

    batch: { type: Number, required: true },

    degree: { type: String, required: true },

    branch: { type: String, required: true },

    section: { type: String, default: "A" },

    currentSemester: { type: Number, required: true },

    email: { type: String, required: true, unique: true },

    personalEmail: { type: String },

    mobile: { type: String },

    firstName: { type: String, required: true },

    lastName: { type: String, required: true },

    dob: { type: String, required: true },

    isCredentialCreated: { type: Boolean, default: false },

    type: { type: String, default: "regular" },

    status: { type: String, default: "active" }

}, { collection: "Students", timestamps: true })


export const StudentsModel = model('Students', StudentsSchema)