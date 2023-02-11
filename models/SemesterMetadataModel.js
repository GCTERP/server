import mongoose from "mongoose"

const { Schema, model } = mongoose

const SemesterMetadataSchema = new Schema({
    
    date: { type: Schema.Types.Date, required: true },

    ut: {

        count: { type: Number, required: true },
    
        duration: { type: Number, required: true },
    
        marks: { type: Number, required: true },
    
        retestCount: { type: Number, required: true },
    
        contribution: { type: Number, required: true }
    
    },

    tutorial: {

        marks: { type: Number, required: true },
        
        count: { type: Number, required: true },
    
        contribution: { type: Number, required: true }        

    },

    assignment: {

        marks: { type: Number, required: true },
        
        count: { type: Number, required: true },
    
        contribution: { type: Number, required: true }        

    },
    
    schedule: {

        opened: { type: Boolean, default: false },
    
        periodCount: { type: Number, required: true },
    
        periodDuration: { type: Number, required: true },
        
        dayOrderType: { type: String, required: true },
    
        workingDaysPerWeek: { type: Number, required: true }
    
    },

    freeze: {

        internal: { type: Number, required: true },
    
        attendance: { type: Number, required: true }
    
    },

    deadline: {

        internal: { type: Schema.Types.Date, required: true },
    
        attendance: { type: Schema.Types.Date, required: true }

    },

    semester: {

        begin: { type: Schema.Types.Date, required: true },
    
        end: { type: Schema.Types.Date },
    
        sem: { type: Number, required: true },
    
        batch: { type: Number, required: true }
    
    },

    valueAddedCourse: [
        {

            type: { type: String, required: true },
        
            regular: { type: Number, required: true },
        
            lateral: { type: Number, required: true },
        
            transfer: { type: Number, required: true }
        
        }
    ],

    facultyAdvisor: [
        {

            branch: { type: String, required: true },
        
            faculty: { type: Schema.Types.ObjectId, required: true, ref: 'Faculty' }
        
        }
    ],

    condonation: { type: Number, required: true },

    feedback: {

        status: { type: String, required: true },
    
        start: { type: Schema.Types.Date },
    
        end: { type: Schema.Types.Date }
    
    },

    enrollment: {

        status: { type: String, required: true },
    
        start: { type: Schema.Types.Date },
    
        end: { type: Schema.Types.Date }
    
    },

    courseRegistration: {

        status: { type: String, required: true },
    
        start: { type: Schema.Types.Date },
    
        end: { type: Schema.Types.Date }
    
    },

    addOnEligible: [
        {

            branch: { type: String, required: true },
        
            course: { type: String, required: true }
        
        }
    ],

    downloadHallticket: { type: Boolean, default: false }

}, { collection: "SemesterMetadata", timestamps: true })


export const SemesterMetadataModel = model('SemesterMetadata', SemesterMetadataSchema)