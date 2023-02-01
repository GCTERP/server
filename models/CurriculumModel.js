import mongoose from "mongoose"

const { Schema, model } = mongoose

const CurriculumSchema = new Schema({
    
    courseCode: { type: String, required: true },

    title: { type: String, required: true },

    type: { type: String, required: true },

    requirement: { type: String },

    category: { type: String, required: true },

    marks: {

        ca: { type: Number, required: true },

        sem: { type: Number, required: true }

    },

    hours: {

        lecture: { type: Number, required: true },

        tutorial: { type: Number, required: true },

        practical: { type: Number, required: true },

        credits: { type: Number, required: true }

    },

    semester: { type: Number, required: true },

    regulation: { type: Number, required: true },

    branch: { type: String, required: true }

}, { collection: "Curriculum", timestamps: true })


export const CurriculumModel = model('Curriculum', CurriculumSchema)