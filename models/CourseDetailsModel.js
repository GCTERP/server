import mongoose from "mongoose"

const { Schema, model } = mongoose

const CourseDetailsSchema = new Schema({

    semType: { type: String, required: true },

    semester: { type: Number, required: true },

    facultyId: { type: Schema.Types.ObjectId, required: true, ref: 'Faculty' },

    courseCode: { type: Schema.Types.ObjectId, required: true, ref: 'Curriculum' },

    type: { type: String, required: true },

    branch: { type: String, required: true },

    batch: { type: Number, required: true },

    groupNo: { type: Number, default: 1 },

    schedule: { type: [Number] },

    freeze: {

        attendance: { type: Boolean, default: false },

        internals: { type: Boolean, default: false }

    },

    attendanceApproval: {

        fa: { type: Boolean, default: false },

        hod: { type: Boolean, default: false }

    },

    unitSchedule: [ {
        date: { type: Schema.Types.Date, default: null },

        number: { type: Number },

        session: { type: String },

        type: { type: String },

        students: { type: [Schema.Types.ObjectId], default: null, ref: 'Students' }
    } ]

}, { collection: "CourseDetails", timestamps: true })


export const CourseDetailsModel = model('CourseDetails', CourseDetailsSchema)