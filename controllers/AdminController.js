import mongoose from "mongoose"

import { StudentsModel } from "../models/StudentsModel.js"

import { StudentDetailsModel } from "../models/StudentDetailsModel.js"

import { excelToJson } from "../utilities/excel-parser.js"
import { FacultyModel } from "../models/FacultyModel.js"


///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////

export const updateStudents = async (req, res) => {

    try {

        let load = req.body

        let { data, trash } = filterValidStudentDocuments(load)

        data.forEach(async doc => {

            await StudentsModel.updateOne({ _id: doc._id }, doc)

            await StudentDetailsModel.updateOne({ studentId: doc._id }, doc)
        })

        let documents = {
            total: load.length,
            updated: data.length,
            trash: trash.length
        } 

        res.status(200).json({ documents, trash: [ ...trash ] })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getStudents = async (req, res) => {

    try {

        let params = req.body

        let find = (params.branch == "ALL") ? { batch: params.batch } : { batch: params.batch, branch: params.branch }

        await StudentsModel.find(find).select( { __v: 0, createdAt: 0, updatedAt: 0 } ).then( async ( students )=>{

            for (let idx in students) {

                let studentDetails = await StudentDetailsModel.find({ studentId: students[idx]._id }).select({ _id: 0, __v: 0 })

                students[idx] = { ...students[idx].toObject(), ...studentDetails[0].toObject() }
                
        }
        res.status(200).json(students)
        })

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }
}

export const uploadStudents = async (req, res) => {

    try {

        let file = req.files.students

        let load = await excelToJson(file), create = [], update = []

        let { data, trash } = filterValidStudentDocuments( load )

        let result = await StudentsModel.find({ register: { $in: data.map(doc => doc.register) } }, { register: 1 })

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

const filterValidStudentDocuments = (load) => {

    let trash = [], data = [], required = ["register", "regulation", "batch", "degree", "branch", "currentSemester", "email", "firstName", "lastName", "dob"]

        // Filter valid documents
        for (let doc of load) {
            let valid = true
            for (let field of required)
                if (!doc[field]) {
                    trash.push({ ...doc })
                    valid = false
                    break
                }
            valid && data.push({ ...doc })
        }
        return { data, trash }

}


///////////////////////  FACULTY MODULE ///////////////////////
export const updateFaculty = async (req, res) => {

    try {

        let load = req.body

        let { data, trash } = filterValidFacultyDocuments(load)

        data.forEach(async doc => {

            await FacultyModel.updateOne({ _id: doc._id }, doc)

        })

        let documents = {
            total: load.length,
            updated: data.length,
            trash: trash.length
        } 

        res.status(200).json({ documents, trash: [ ...trash ] })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getFaculty = async (req, res) => {

    try {

        let params = req.body.branch

        let find = (params == "ALL") ? null : { branch: params }

        let faculty =  await FacultyModel.find(find).select( { __v: 0, createdAt: 0, updatedAt: 0 } )

        res.status(200).json(faculty)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }
}

export const uploadFaculty = async (req, res) => {

    try {

        let file = req.files.faculty

        let load = await excelToJson(file), create = [], update = []

        let { data, trash } = filterValidFacultyDocuments( load )

        let result = await FacultyModel.find({ facultyId: { $in: data.map(doc => doc.facultyId) } }, { facultyId: 1 })

        console.log(result.length)
        // Find existing documents
        for(let doc of data) {
            let flag = true
            for(let rdoc of result) {
                if(doc.facultyId == rdoc.facultyId) {
                    update.push({...doc, _id: rdoc._id})
                    flag = false
                    break
                }
            }   flag && create.push({...doc})
        }

        // Creation
        if(create.length > 0) await facultyCreation( create )

        // Updation
        if(update.length > 0)
            for(let doc of update)
                await facultyUpdation(doc)

        let documents = {
            total: load.length,
            created: create.length,
            update: update.length,
            trash: trash.length
        } 
        
        res.status(200).json({ documents, trash: [...trash] })

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

const facultyCreation = async (data) => {

    await FacultyModel.create(data)
    
}

const facultyUpdation = async (data) => {

    const id = data._id

    delete data._id

    await FacultyModel.updateOne({ _id: id }, data)

}


const filterValidFacultyDocuments = (load) => {

    let trash = [], data = [], required = [ "facultyId", "email", "personalEmail", "mobile", "primaryRole", "branch", "firstName", "lastName" ]

        // Filter valid documents
        for (let doc of load) {
            let valid = true
            for (let field of required)
                if (!doc[field]) {
                    trash.push({ ...doc })
                    valid = false
                    break
                }
            valid && data.push({ ...doc })
        }
        return { data, trash }

}


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


