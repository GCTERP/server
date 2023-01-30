import mongoose from "mongoose"

const { Schema, model } = mongoose

const ExamPaymentSchema = new Schema({
    
    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Students' },

    amount: { type: Number, required: true },

    paid: { type: Boolean, default: false },

    referenceId: { type: String, required: true },

    date: { type: Schema.Types.Date },

    branch: { type: String, required: true },

    batch: { type: Number, required: true },

    semester: { type: Number, required: true }

}, { collection: "ExamPayment", timestamps: true })


export const ExamPaymentModel = model('ExamPayment', ExamPaymentSchema)