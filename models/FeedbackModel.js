import mongoose from "mongoose"

const { Schema, model } = mongoose

const FeedbackSchema = new Schema({

    semType: { type: String, required: true },

    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Students' },

    facultyId: { type: Schema.Types.ObjectId, required: true, ref: 'Faculty' },

    courseCode: { type: String, required: true },

    batch: { type: Number, required: true },

    branch: { type: String, required: true },

    semester: { type: Number, required: true },

    feedback: [
        {

            questionId: { type: Schema.Types.ObjectId, ref: 'FeedbackQuestions' },
        
            score: { type: Number }
        
        }
    ],

}, { collection: "Feedback", timestamps: true })


export const FeedbackModel = model('Feedback', FeedbackSchema)