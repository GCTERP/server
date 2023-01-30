import mongoose from "mongoose"

const { Schema, model } = mongoose

const MasterTimetableSchema = new Schema({
    
    date: { type: Schema.Types.Date, required: true },

    branch: { type: String, required: true },

    batch: { type: Number, required: true },

    dayOrder: { type: String, required: true },

    workingDay: { type: Boolean, default: false },

    reason: { type: String },

    courseId: { type: Schema.Types.ObjectId, required: true, ref: 'CourseDetails' },

    facultyId: { type: Schema.Types.ObjectId, required: true, ref: 'Faculty' },

    period: { type: Number, required: true },

    type: { type: String, required: true },

    marked: { type: Number, default: 0 },

    freeze: { type: Boolean, default: false }

}, { collection: "MasterTimetable", timestamps: true })


export const MasterTimetableModel = model('MasterTimetable', MasterTimetableSchema)