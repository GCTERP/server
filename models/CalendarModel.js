import mongoose from "mongoose"

const { Schema, model } = mongoose

const CalendarSchema = new Schema({

    date: { type: Date, required: true, unique: true },

    day: { type: String, rewuired: true },

    isWorkingDay: { type: Boolean, default: true },

    batches: { type: [Number], default: null },

    order: { type: String, default: null },

    reason: { type: String, default: null },
   
    events: { type: [String], default: null }

}, { collection: "Calendar", timestamps: true })

export const CalendarModel = model("Calendar", CalendarSchema)