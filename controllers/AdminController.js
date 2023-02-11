import mongoose from "mongoose"

import { StudentsModel } from "../models/StudentsModel.js"

import { StudentDetailsModel } from "../models/StudentDetailsModel.js"

import { excelToJson } from "../utilities/excel-parser.js"
import { FacultyModel } from "../models/FacultyModel.js"
import { UsersModel } from "../models/UsersModel.js"


///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////
export const getStudentUsers = async (req, res) => {

    try {

        let { batch } = req.body

        // Finds students by batch and returning the result with onlt required fields
        let students = await StudentsModel.find({ batch }, { __v: 0, createdAt: 0, updatedAt: 0, regulation: 0, degree: 0, dob: 0 })

        res.status(200).json(students)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

// Create or delete student account from collection based on activation status
export const manageStudentAccount = async (req, res) => {

    try {

        let students = req.body

        students.forEach(async student => {

            let id = student._id

            delete student["_id"]

            let credentials = { email: student.email, personalEmail: student.personalEmail, userType: "Student" }

            if (student.isActive) await UsersModel.updateOne({ email: student.email }, credentials, { upsert: true })
            else await UsersModel.deleteOne({ email: student.email })

            await StudentsModel.updateOne({ _id: id }, student)

        })

        res.status(200).send(students.length + " student document(s) updated")
    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

// Gets the all faculty from the db 
export const getFacultyUser = async (req, res) => {

    try {

        let faculty = await FacultyModel.find({}, { __v: 0, createdAt: 0, updatedAt: 0, admin: 0, cfa: 0, hod: 0, pc: 0, ttc: 0, fa: 0, ci: 0, primaryRole: 0, address: 0 })

        res.status(200).json(faculty)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

// This function manages the faculty account - either the faculty user get added to the user model or get deleted from the user model 
// When the admin move the user from the acive to inactive state or vice versa
export const manageFacultyAccount = async (req, res) => {

    try {

        let faculty = req.body

        faculty.forEach(async doc => {

            let id = doc._id

            delete doc._id 

            let credentials = { email: doc.email, personalEmail: doc.personalEmail, userType: "Faculty" }

            if (doc.isActive) await UsersModel.updateOne({ email: doc.email }, credentials, { upsert: true })
            else await UsersModel.deleteOne({ email: doc.email }, doc)

            await FacultyModel.updateOne({ _id: id }, doc)

        })

        res.status(200).send(faculty.length + " faculty document(s) updated")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

///////////////////////  STUDENTS MODULE ///////////////////////

// Filters the trash documents and updates the remainig documents
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

        res.status(200).json({ documents, trash: [...trash] })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

// Gets all the students of a particular batch
export const getStudents = async (req, res) => {

    try {

        let { batch } = req.body

        let ids = await StudentsModel.find({ batch }, { _id: 1 })

        let Students = await StudentDetailsModel.find({ studentId:{ $in: ids.map( student => student._id) }}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).populate("studentId", { __v: 0, createdAt: 0, updatedAt: 0 })

        Students = Students.map( doc => {
            doc = doc.toObject()
            let Student = doc.studentId
            delete doc.studentId
            doc = { ...Student, ...doc}
            console.log(doc)
            return doc
        })
        res.status(200).json(Students)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }
}

// Uploads the students
export const uploadStudents = async (req, res) => {

    try {

        let file = req.files.students

        let load = await excelToJson(file), create = [], update = []

        let { data, trash } = filterValidStudentDocuments(load)

        let result = await StudentsModel.find({ register: { $in: data.map(doc => doc.register) } }, { register: 1 })

        // Find existing documents
        for (let doc of data) {
            let flag = true
            for (let rdoc of result) {
                if (doc.register == rdoc.register) {
                    update.push({ ...doc, _id: rdoc._id })
                    flag = false
                    break
                }
            } flag && create.push({ ...doc })
        }

        // Creation
        if (create.length > 0) await studentCreation(create)

        // Updation
        if (update.length > 0)
            for (let doc of update)
                await studentUpdation(doc)

        let documents = {
            total: load.length,
            created: create.length,
            update: update.length,
            trash: trash.length
        }

        res.status(200).json({ documents, trash: [...trash] })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

const studentCreation = async (data) => {

    // Creates Id and stores the id for 2 schema
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

        res.status(200).json({ documents, trash: [...trash] })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getFaculty = async (req, res) => {

    try {

        let faculty = await FacultyModel.find({}, { __v: 0, createdAt: 0, updatedAt: 0 })

        res.status(200).json(faculty)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }
}

export const uploadFaculty = async (req, res) => {

    try {

        let file = req.files.faculty

        let load = await excelToJson(file), create = [], update = []

        let { data, trash } = filterValidFacultyDocuments(load)

        let result = await FacultyModel.find({ facultyId: { $in: data.map(doc => doc.facultyId) } }, { facultyId: 1 })

        console.log(result.length)
        // Find existing documents
        for (let doc of data) {
            let flag = true
            for (let rdoc of result) {
                if (doc.facultyId == rdoc.facultyId) {
                    update.push({ ...doc, _id: rdoc._id })
                    flag = false
                    break
                }
            } flag && create.push({ ...doc })
        }

        // Creation
        if (create.length > 0) await facultyCreation(create)

        // Updation
        if (update.length > 0)
            for (let doc of update)
                await facultyUpdation(doc)

        let documents = {
            total: load.length,
            created: create.length,
            update: update.length,
            trash: trash.length
        }

        res.status(200).json({ documents, trash: [...trash] })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
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

    let trash = [], data = [], required = ["facultyId", "email", "personalEmail", "mobile", "primaryRole", "branch", "firstName", "lastName"]

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


