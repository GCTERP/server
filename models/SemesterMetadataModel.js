import mongoose from "mongoose"

const { Schema, model } = mongoose

const SemesterMetadataSchema = new Schema({
    
    date: { type: Schema.Types.Date, required: true },

    ut: {

        count: { type: Number },
    
        duration: { type: Number },
    
        marks: { type: Number },
    
        retestCount: { type: Number },
    
        contribution: { type: Number }
    
    },

    tutorial: {

        marks: { type: Number },
        
        count: { type: Number },
    
        contribution: { type: Number }        

    },

    assignment: {

        marks: { type: Number },
        
        count: { type: Number },
    
        contribution: { type: Number }        

    },
    
    schedule: {

        opened: { type: Boolean, default: false },
    
        periodCount: { type: Number },
    
        periodDuration: { type: Number },
        
        isDayOrder: { type: Boolean },
    
        workingDaysPerWeek: { type: Number }
    
    },

    freeze: {

        internal: { type: Number },
    
        attendance: { type: Number }
    
    },

    deadline: {

        internal: { type: Schema.Types.Date },
    
        attendance: { type: Schema.Types.Date }

    },

    semester: {

        begin: { type: Schema.Types.Date },
    
        end: { type: Schema.Types.Date },
    
        sem: { type: Number },
    
        batch: { type: Number }
    
    },

    valueAddedCourse: [
        {

            type: { type: String },
        
            regular: { type: Number },
        
            lateral: { type: Number },
        
            transfer: { type: Number }
        
        }
    ],

    facultyAdvisor: [
        {

            branch: { type: String },
        
            faculty: { type: Schema.Types.ObjectId, ref: 'Faculty' }
        
        }
    ],

    condonation: { type: Number },

    feedback: {

        status: { type: String },
    
        start: { type: Schema.Types.Date },
    
        end: { type: Schema.Types.Date }
    
    },

    enrollment: {

        status: { type: String },
    
        start: { type: Schema.Types.Date },
    
        end: { type: Schema.Types.Date }
    
    },

    courseRegistration: {

        status: { type: String },
    
        start: { type: Schema.Types.Date },
    
        end: { type: Schema.Types.Date }
    
    },

    addOnEligible: [
        {

            branch: { type: String },
        
            course: { type: String }
        
        }
    ],

    downloadHallticket: { type: Boolean, default: false }

}, { collection: "SemesterMetadata", timestamps: true })


export const SemesterMetadataModel = model('SemesterMetadata', SemesterMetadataSchema)