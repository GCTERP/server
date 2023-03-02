import mongoose from "mongoose"

const { Schema, model } = mongoose

const BranchSchema = new Schema({
    
    name: { type: String, required: true },

    branch: { type: String, required: true },

    code: { type: Number, required: true },

    key: { type: String, required: true },

    startDate: { type: Schema.Types.Date },

    capacity: { type: Number },

    graduate: { type: String },

    degree: { type: String }

}, { collection: "Branch", timestamps: true })


export const BranchModel = model('Branch', BranchSchema)