import mongoose from "mongoose"

const { Schema, model } = mongoose 

const StudentDetailsSchema = new Schema({
    
    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Student' },

    NADId: { type: String },

    dob: { type: Schema.Types.Date, required: true },

    gender: { type: String, required: true },

    father: {
    
        name: { type: String },

        mobile: { type: String },

        occupation: { type: String },

        income: { type: String }
    },

    mother: {

        name: { type: String },

        mobile: { type: String },

        occupation: { type: String },

        income: { type: String }
    },

    guardian: {

        name: { type: String },

        mobile: { type: String },

        occupation: { type: String },

        income: { type: String }
    },

    permanentAddress: { type: String, required: true },

    temporaryAddress: { type: String },

    aadhaar: { type: String, required: true },

    doj: { type: Schema.Types.Date },

    tenth: {

        school: { type: String },

        studyPeriod: { type: String },

        board: { type: String },

        percentage: { type: Number },

        passingYear: { type: Number }
    },

    twelveth: {

        school: { type: String },

        studyPeriod: { type: String },

        board: { type: String },

        percentage: { type: Number },

        passingYear: { type: Number }
    },

    diploma: {

        institution: { type: String },

        studyPeriod: { type: String },

        affiliation: { type: String },

        branch: { type: String },

        percentage: { type: Number },

        passingYear: { type: Number }
    },

    undergraduate: {

        college: { type: String },

        studyPeriod: { type: String },

        affiliation: { type: String },

        branch: { type: String },

        percentage: { type: Number },

        passingYear: { type: Number }
    }

}, { collection: "StudentDetails", timestamps: true })


export const StudentDetailsModel = model('StudentDetails', StudentDetailsSchema)