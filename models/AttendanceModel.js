import mongoose from "mongoose"

const { Schema, model } = mongoose

const AttendanceSchema = new Schema({
    
    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Students' },

    courseCode: { type: String, required: true },

    branch: { type: String, required: true },

    batch: { type: Number, required: true },

    date: { type: Schema.Types.Date, required: true },

    period: { type: Number, required: true },

    present: { type: Boolean, default: false },

    onduty: { type: Boolean, default: false }

}, { collection: "Attendance", timestamps: true })


export const AttendanceModel = model('Attendance', AttendanceSchema)