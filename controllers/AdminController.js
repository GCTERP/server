import mongoose from "mongoose"
import fs from "fs"

import { StudentsModel } from "../models/StudentsModel.js"

import { StudentDetailsModel } from "../models/StudentDetailsModel.js"

import { excelToJson } from "../utilities/excel-parser.js"


///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////
export const getStudents = async (req, res) => {

    try {

        let { batch, branch } = req.body

        let result = await StudentsModel.find({ batch: batch, branch: branch })

        res.status(200).json(result)

    }   catch(err) { res.status(400).send("Request Failed: " + err.message) }
}

export const uploadStudents = async (req, res) => {

    try {

        let file = req.files.students, time = Date.now().toString()

        await file.mv("./trash/" + time + ".xlsx")

        let load = excelToJson("./trash/" + time + ".xlsx"), create = [], update = [], trash = [], data = []

        fs.unlinkSync("./trash/" + time + ".xlsx")

        let result = await StudentsModel.find({ register: { $in: load.map(doc => doc.register) } }, { register: 1 })

        let required = [ "register", "regulation", "batch", "degree", "branch", "currentSemester", "email", "firstName", "lastName", "dob" ]

        // Filter valid documents
        for(let doc of load){
            let valid = true
            for(let field of required)
                if(!doc[field]) {
                    trash.push({...doc})
                    valid = false
                    break
                }
            valid && data.push({...doc})
        }

        // Find existing documents
        for(let doc of data) {
            let flag = true
            for(let rdoc of result) {
                if(doc.register == rdoc.register) {
                    update.push({...doc, _id: rdoc._id})
                    flag = false
                    break
                }
            }   flag && create.push({...doc})
        }

        // Creation
        if(create.length > 0) await studentCreation(create)

        // Updation
        if(update.length > 0)
            for(let doc of update)
                await studentUpdation(doc)

        let documents = {
            total: load.length,
            created: create.length,
            update: update.length,
            trash: trash.length
        } 
        
        res.status(200).json({ documents, trash: [...trash] })

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

const studentCreation = async (data) => {

    data = data.map(doc => { doc["studentId"] = doc["_id"] = mongoose.Types.ObjectId(); return doc })

    await StudentsModel.create(data)

    data = data.map(doc => { delete doc["_id"]; return doc })

    await StudentDetailsModel.create(data)
}

const studentUpdation = async (data) => {

    const id = data._id

    delete data._id

    await StudentsModel.updateOne({ _id: id }, data)

    await StudentDetailsModel.updateOne({ studentId: id }, data)
}


///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////


