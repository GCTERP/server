import mongoose from "mongoose"

const { Schema, model } = mongoose

const RequestsSchema = new Schema({
    
    from: { type: Schema.Types.ObjectId, required: true, refPath: 'fromRef' },

    fromRef: { type: String, enum: ['Students', 'Faculty', 'MasterTimetable'] },

    to: { type: Schema.Types.ObjectId, required: true, ref: 'Faculty' },

    other: { type: Schema.Types.ObjectId, refPath: 'otherRef' },

    otherRef: { type: String },

    body: { type: String },

    type: { type: String, required: true },

    approved: { type: Boolean, default: false },
 
    deadline: { type: Schema.Types.Date },

    done: { type: Boolean, default: false }

}, { collection: "Requests", timestamps: true })


export const RequestsModel = model('Requests', RequestsSchema)