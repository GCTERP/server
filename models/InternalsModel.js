import mongoose from "mongoose"

const { Schema, model } = mongoose

const InternalsSchema = new Schema({
    
    enrollmentId: { type: Schema.Types.ObjectId, required: true, ref: 'Enrollment' },
    
    category: { type: String, required: true },

    type: { type: String, required: true },

    number: { type: String, required: true },

    markObtained: { type: Number, required: true }

}, { collection: "Internals", timestamps: true })


export const InternalsModel = model('Internals', InternalsSchema)