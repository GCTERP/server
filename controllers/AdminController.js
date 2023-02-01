import mongoose from "mongoose"
import fs from "fs"

import { StudentsModel } from "../models/StudentsModel.js"

import { StudentDetailsModel } from "../models/StudentDetailsModel.js"

import { excelToJson } from "../utilities/excel-parser.js"


///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////
export const uploadStudents = async (req, res) => {

    try {

        let file = req.files.students, time = Date.now().toString()

        await file.mv("./trash/" + time + ".xlsx")

        let data = excelToJson("./trash/" + time + ".xlsx"), create = [], update = []

        let result = await StudentsModel.find({ register: { $in: data.map(doc => doc.register) } }, { register: 1 })

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

        res.status(200).send(`SUCCESS: ${data.length} documents uploaded, ${create.length} documents created, ${update.length} documents updated`)

        fs.unlinkSync("./trash/" + time + ".xlsx")

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


