import mongoose from "mongoose"

const { Schema, model } = mongoose

const COAttainmentSchema = new Schema({
    
    internalsId: { type: Schema.Types.ObjectId, required: true, ref: 'Internals' },

    question: { type: Number, required: true },

    cotype: { type: Number, required: true },

    total: { type: Number, required: true },

    obtained: { type: Number, required: true }

}, { collection: "COAttainment", timestamps: true })


export const COAttainmentModel = model('COAttainment', COAttainmentSchema)