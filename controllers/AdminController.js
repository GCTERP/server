import mongoose, { set } from "mongoose"

import { StudentsModel } from "../models/StudentsModel.js"
import { StudentDetailsModel } from "../models/StudentDetailsModel.js"
import { EnrollmentModel } from '../models/EnrollmentModel.js'
import { ExternalsModel } from '../models/ExternalsModel.js'
import { excelToJson, jsonToExcel } from "../utilities/excel-parser.js"
import { FacultyModel } from "../models/FacultyModel.js"
import { UsersModel } from "../models/UsersModel.js"
import { CalendarModel } from "../models/CalendarModel.js"
import { SemesterMetadataModel } from "../models/SemesterMetadataModel.js"
import { redis } from "../index.js"
import { BranchModel } from "../models/BranchModel.js"
import { CurriculumModel } from "../models/CurriculumModel.js"
import { ElectiveMetadataModel } from "../models/ElectiveMetadataModel.js"

///////////////////////  CACHE ///////////////////////

//Batch cache
function setCache(redisKey, data){
    redis.set(redisKey, JSON.stringify(data))
}

export const getBatch = async (req, res) => {

    try {

        let data = await redis.get("SEMESTER_METADATA")
        
        if(data!==null) data = JSON.parse(data)
        else{

            data = await SemesterMetadataModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })
            setCache("SEMESTER_METADATA", data)

        }
        
        data = data.map( doc => doc.batch )
        data = new Set(data.sort(function(a, b){return(b-a)}))
        res.status(200).json({ batches: [...data] }) 

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const getBranchCache = async (req, res) => {

    try {

        let data = await redis.get("BRANCH")

        if(data!==null) data = JSON.parse(data)
        else{

            data = await BranchModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })
            setCache("BRANCH", data)

        }

        res.status(200).json(data)

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const getRegulation = async (req, res) => {

    try {

        let data = await redis.get("SEMESTER_METADATA")
        
        if(data!==null) data = JSON.parse(data)
        else{

            data = await SemesterMetadataModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })
            setCache("SEMESTER_METADATA", data)

        }
        
        data = data.map( doc => doc.regulation )
        data = new Set(data.sort(function(a, b){return(b-a)}))
        res.status(200).json({ batches: [...data] }) 

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

///////////////////////  ADMIN MODULE ///////////////////////

//Create calendar
export const createCalendar = async (req, res) => {

    try {

        let { from, to, isSaturdayHoliday } = req.body

        from = new Date(from)
        to = new Date(to)

        let dates = generateCalendar(from, to, isSaturdayHoliday)

        let check = await CalendarModel.find({ date: { $in:[from, to] } })

        if(check.length==0)  await CalendarModel.create(dates) 
        else res.status(200).send("Date already exist in calendar")

        res.status(200).send("Success")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const manageSaturday = async (req, res) => {

    try {

        let { from, to, batches, isWorkingDay } = req.body

        let data = await CalendarModel.find({ date: { $gte: new Date(from), $lte: new Date(to) }, day: 'Saturday' }, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ date: 'asc' })

        for (let doc of data) {

            doc.isWorkingDay = isWorkingDay
            if (isWorkingDay) {

                batches.forEach(batch => {
                    (!doc.batches.includes(batch)) && doc.batches.push(batch)
                })

            } else{
                doc.order = null
                doc.batches = null
            }

            let _id = doc._id
            delete doc._id

            await CalendarModel.updateOne({ _id: _id }, doc)

        }

        res.status(200).send("Success")


    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const declareHoliday = async (req, res) => {

    try {

        let load = req.body

        if (isDayOrder) {

            let currentOrder = load[0].order

            let currentDate = load[0].date

            for (let doc of load) {
                let id = doc._id
                delete doc._id
                doc.isWorkingDay = false
                doc.order = null
                doc.batches = null

                await CalendarModel.updateOne({ _id: id }, doc)
            }

            let data = await CalendarModel.find({ date: { $gte: new Date(currentDate) }, isWorkingDay: true }, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ date: 'asc' })

            data.map(async doc => {

                if (doc.day != "Saturday") {
                    (doc.order = currentOrder)
                    if ((currentOrder % 5) == 0) {
                        currentOrder = 5
                        currentOrder = 1
                    } else currentOrder++
                }

                let id = doc._id
                delete doc._id
                await CalendarModel.updateOne({ _id: id }, doc)
            })


        } else {

            for (let doc of data) {
                let id = doc._id
                delete doc._id
                doc.isWorkingDay = false
                doc.order = null
                doc.batches = null
                await CalendarModel.updateOne({ _id: id }, doc)
            }

        }

        res.status(200).json(await CalendarModel.find().sort({ date: 'asc' }))
    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const addWorkingDay = async (req, res) => {

    try {

        let data = { ...req.body, isWorkingDay: true }
        await CalendarModel.updateOne({ date: (data.date) }, data)

        res.status(200).send("Success")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getAllDates = async (req, res) => {

    try {

        let data = await CalendarModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ date: 'asc' })

        res.status(200).json(data)

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const manageBatchInCalendar = async (req, res) => {

    try {

        let { batch, from, to, addBatch } = req.body

        let data = await CalendarModel.find({ date: { $gte: new Date(from), $lte: new Date(to) }, batch: { $contains : batch  }, isWorkingDay: true }, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ date: 'asc' })

        data = data.map(async doc => {

            if(!addBatch){
                doc.batches = doc.batches.filter( ele => ele != batch )
                if(doc.batches) (doc.order = null)
            }else if(!doc.batches.includes(batch)) doc.batches.push(batch)
            let id = doc._id
            delete doc._id
            await CalendarModel.updateOne({_id:id}, doc)
        } )

        res.status(200).send("Success")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const extendSemesterDuration = async (req, res) => {

    try {

        let { from, to, batch, proccedDayOrderWith } = req.body

        //This allots the day order for the batch for the given dates
        let data = await CalendarModel.find({ date: { $gte: new Date(from), $lte: new Date(to) }, isWorkingDay: true }, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ date: 'asc' })
        if (!isDayOrder) {
            for (let doc of data) {
                if(!doc.batches.includes(batch)) doc.batches.push(batch)
                if( doc.isWorkingDay && doc.order == null ) (doc.order = doc.date.getDay())

                let _id = doc._id
                delete doc._id
                await CalendarModel.updateOne({ _id: _id }, doc)
            }

        } else {

            let dayOrder = data[0].order ?? proccedDayOrderWith
            for (let doc of data) {

                if(!doc.batches.includes(batch)) doc.batches.push(batch)

                let currentDayOrder = dayOrder
                if ((dayOrder % workingDaysPerWeek) == 0) {
                    currentDayOrder = workingDaysPerWeek
                    dayOrder = 1
                } else dayOrder++
                doc.order = doc.order ?? currentDayOrder

                let _id = doc._id
                delete doc._id
                await CalendarModel.updateOne({ _id: _id }, doc)
            }

        }



    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}
// Generates calendar for given dates
function generateCalendar(startDate, endDate, isSaturdayHoliday = true) {

    let currentDate = new Date(startDate);
    endDate = new Date(endDate)

    let dates = [];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    while (currentDate <= endDate) {

        let day = currentDate.getDay()

        let isWorkingDay = (isSaturdayHoliday && day == 6) || (day == 0) ? false : true

        dates.push({ date: new Date(currentDate), day: days[day], isWorkingDay: isWorkingDay });

        currentDate.setDate(currentDate.getDate() + 1);

    }

    return dates;

}


//Semester Metadata
export const createMetadata = async (req, res) => {

    try {

        let metaData = req.body
        let batch = metaData.batch, semester = metaData.sem, from = metaData.begin, to = metaData.end, isDayOrder = metaData.schedule.isDayOrder, workingDaysPerWeek = metaData.schedule.workingDaysPerWeek

        //This allots the day order for the batch for the given dates
        let data = await CalendarModel.find({ date: { $gte: new Date(from), $lte: new Date(to) }, isWorkingDay: true }, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ date: 'asc' })
        if (!isDayOrder) {
            for (let doc of data) {
                if(!doc.batches.includes(batch)) doc.batches.push(batch)
                if( doc.isWorkingDay && doc.order == null ) (doc.order = doc.date.getDay())

                let _id = doc._id
                delete doc._id
                await CalendarModel.updateOne({ _id: _id }, doc)
            }

        } else {

            let dayOrder = data[0].order ?? 1
            for (let doc of data) {

                if(!doc.batches.includes(batch)) doc.batches.push(batch)

                let currentDayOrder = dayOrder
                if ((dayOrder % workingDaysPerWeek) == 0) {
                    currentDayOrder = workingDaysPerWeek
                    dayOrder = 1
                } else dayOrder++

                doc.order = doc.order ?? currentDayOrder

                let _id = doc._id
                delete doc._id
                await CalendarModel.updateOne({ _id: _id }, doc)
            }

        }

        let forCache = await SemesterMetadataModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })

        //Checks whether the batch and sem already exists
        let check = forCache.filter( (doc) => doc.batch == batch && doc.sem == semester )

        //Creates a doc in semester metadata
        if (check.length==0){ 
            await SemesterMetadataModel.create(metaData)
            forCache.push(metaData)
            setCache("SEMESTER_METADATA", forCache)
            res.status(200).send("Semester metadata created successfully!")
        }

        else res.status(200).send("Semester for this batch already exists !!!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const updateMetadata = async (req, res) => {

    try {

        let updates = req.body

        let id = updates._id

        delete updates._id

        await SemesterMetadataModel.updateOne( {_id: id}, updates )

        let forCache = await SemesterMetadataModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 })
        setCache("SEMESTER_METADATA", forCache)

        res.status(200).send("Semester metadata updated successfully!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const getMetadata = async (req, res) => {

    try {

        let meta = await SemesterMetadataModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ createdAt:'desc' })

        res.status(200).json(meta)

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

//Branch
export const manageBranch = async (req, res) => {
    try {

        let data = req.body

        await BranchModel.updateOne( { branch: data.branch }, data, { upsert: true } )

        let branch = await BranchModel.find( {}, { createdAt: 0, updatedAt: 0, __v: 0 } )

        setCache("BRANCH", branch)

        res.status(200).send("Branch updates successfully!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const getBranch = async (req, res) => {

    try {

        let data = await BranchModel.find( {}, { createdAt: 0, updatedAt: 0, __v: 0 } )

        res.status(200).json(data)

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

// Electives
export const manageElectives = async (req, res) => {
    try {

        let data = req.body

        await ElectiveMetadataModel.updateOne( { branch: data.branch }, data, { upsert: true } )

        let electives = await ElectiveMetadataModel.find( {}, { createdAt: 0, updatedAt: 0, __v: 0 } )

        res.status(200).send("Electives updates successfully!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const getElectives = async (req, res) => {

    try {

        let data = await ElectiveMetadataModel.find( {}, { createdAt: 0, updatedAt: 0, __v: 0 } )

        res.status(200).json(data)

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

///////////////////////  USERS MODULE ///////////////////////
export const getStudentUsers = async (req, res) => {

    try {

        let { batch } = req.query

        // Finds students by batch and returning the result with only required fields
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
export const updateStudent = async (req, res) => {

    try {

        studentUpdation(req.body)

        res.status(200).send("Student data updated successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

// Gets all the students of a particular batch
export const getStudents = async (req, res) => {

    try {

        let { batch } = req.query

        let ids = await StudentsModel.find({ batch }, { _id: 1 })

        let Students = await StudentDetailsModel.find({ studentId: { $in: ids.map(student => student._id) } }, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).populate("studentId", { __v: 0, createdAt: 0, updatedAt: 0 })

        Students = Students.map(doc => {
            doc = doc.toObject()
            let Student = doc.studentId
            delete doc.studentId
            doc = { ...Student, ...doc }
            return doc
        })

        res.status(200).json(Students)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }
}


// This returns the xlsx file with required students data
export const downloadStudents = async (req, res) => {

    try {

        let { ids } = req.query

        let Students = await StudentDetailsModel.find({ studentId: { $in: ids } }, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).populate("studentId", { __v: 0, createdAt: 0, updatedAt: 0 })

        Students = Students.map(doc => {
            doc = doc.toObject()
            let Student = doc.studentId
            delete doc.studentId
            doc = { ...Student, ...doc }
            return doc
        })

        let blob = jsonToExcel(Students)
        
        res.status(200).send(blob)

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

        facultyUpdation(req.body)

        res.status(200).send("Faculty data updated successfully")

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

// This returns the xlsx file with required faculty data
export const downloadFaculty = async (req, res) => {

    try {

        let { ids } = req.query

        let Faculty = await FacultyModel.find({ _id: { $in: ids } }, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 })

        let blob = jsonToExcel(Faculty)
        
        res.status(200).send(blob)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }
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

const curriculumUpdation = async (data) => {

    const id = data._id

    delete data._id

    await CurriculumModel.updateOne({ _id: id }, data)

}


const curriculumCreation = async (data) => {

    await CurriculumModel.create(data)

}

const filterValidCurriculumDocuments = (load) => {

    let trash = [], data = [], required = ["courseCode", "title", "type", "category", "semester", "regulation", "branch","type", "hours", "marks"]

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

export const uploadCurriculum = async (req, res) => {

    try {

        let file = req.files.curriculum

        let load = await excelToJson(file), create = [], update = []

        let { data, trash } = filterValidCurriculumDocuments(load)

        let result = await CurriculumModel.find({ courseCode: { $in: data.map(doc => doc.courseCode) } }, { courseCode: 1 })

        // Find existing documents
        for (let doc of data) {
            let flag = true
            for (let rdoc of result) {
                if (doc.courseCode == rdoc.courseCode) {
                    update.push({ ...doc, _id: rdoc._id })
                    flag = false
                    break
                }
            } flag && create.push({ ...doc })
        }

        // Creation
        if (create.length > 0) await curriculumCreation(create)

        // Updation
        if (update.length > 0)
            for (let doc of update)
                await curriculumUpdation(doc)

        let documents = {
            total: load.length,
            created: create.length,
            update: update.length,
            trash: trash.length
        }

        res.status(200).json({ documents, trash: [...trash] })




    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const getCurriculum = async (req, res) => {

    try {

        let { regulation } = req.query
        let curriculum = await CurriculumModel.find({ regulation: regulation }, { __v: 0, createdAt: 0, updatedAt: 0 })

        res.status(200).json(curriculum)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }
}

export const updateCurriculum = async (req, res) => {

    try {

        curriculumUpdation(req.body)

        res.status(200).send("Course updated successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }

}
/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////

// fetch data to feed the enrollment page 
export const CE_Admin_getenrolledstudentslist = async(req, res) => {
    try{
        const { batch, sem, branch } = req.body
        
        const data = await EnrollmentModel.find({batch:batch, branch:{$in:branch},semester:{$in:sem}}, {courseCode:1,studentId:1,branch:1,enrolled:1,approval:1,_id:0}).populate("courseCode", {courseCode:1,title:1}).populate("studentId",{firstName:1,register:1,branch:1,batch:1})     
             

        let result = []
        for(let doc of data) {
            let flag = result.some(rdoc =>  rdoc.courseCode == doc.courseCode.courseCode)
            if(flag) continue
            
            const obj = {
                courseCode: doc.courseCode.courseCode,
                courseTitle: doc.courseCode.title,
                students: data.filter(ndoc => ndoc.courseCode.courseCode == doc.courseCode.courseCode && { registerNumber: doc.studentId.register, StudentName: doc.studentId.firstName })
            }
            result.push(obj)
        }
   
        let courses = []
        for(let i of result){
            let nstudents = []
            let studentcount = 0
            for(let student of i.students){
                
               
               
                studentcount = studentcount + 1
                const nstudent = {
                    registernumber : student.studentId.register,
                    studentname : student.studentId.firstName,
                    branch : student.studentId.branch,
                    batch : student.studentId.batch,
                    enrolled : student.enrolled,
                    approval : student.approval
                }
                nstudents.push(nstudent)
            }
            const course = {
                courseCode : i.courseCode,
                courseTitle: i.courseTitle,
                studentsenrolled:studentcount,
            //    studentsEnrolled:
                studentsList:nstudents
                
            }
            courses.push(course)
        }

        res.status(200).json(courses)
        
        //     enrollmentdata.forEach(groupdata)
        // //    finaldetails
        
        //     function groupdata(eachcourse){
            
            //         const course = {
                //            courseCode : eachcourse.courseCode.courseCode,
                //            courseTitle: eachcourse.courseCode.title,
                //         //    studentsEnrolled:
    //             studentsList:[{sturegnum:eachcourse.studentId.register,studentname:eachcourse.studentId.firstName}]
    //         }
    //         courses.push(course)

    //         // return courses
    //     }
        // console.log(courses)
        //     res.status(200).json({success:true,message:"Enrolled student details are fetched",totalcourse:enrollmentdata.length,courses})
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

// manage approving the students
export const CE_Admin_approvestudents = async(req, res) => {
    try{
        const {courses} = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = []
        let invalidregisternumber = []

        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
           
            if(!courseinfo){
                message = "Course Code was not found"
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }
            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                
                if(!studentinfo){
                    message = "Student register number was not found"
                    success = false
                    
                    invalidregisternumber.push(student.register)
                    continue
                }
               
                const enrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
               
                if(!enrollmentdata){
                    message = "These Students have not enrolled for given courses"
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
                if(enrollmentdata.approval == 10 && enrollmentdata.enrolled){
                    message = "These students are already enrolled/approved"
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }

                if(student.approval == -4){
                    enrollmentdata.enrolled = false
                    enrollmentdata.approval = -4
                }
                
                if(student.approval == 4){
                    enrollmentdata.approval = student.approval
                    enrollmentdata.enrolled = true
                }else{
                    enrollmentdata.enrolled = false
                }

                const result = await enrollmentdata.save()
                
                if(!result){
                    message = "Unable to save the changes"
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
            }
        }
       
        if(!success){
            res.status(200).json({success:success,message:message,invalidCourseCode,invalidregisternumber})
        }
        else{
            res.status(200).json({success:success,message:message})
        }
  
        
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

// Adding students to enrollment
export const CE_Admin_addstudents = async(req, res) => {
    try{
        const {courses} = req.body

        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = [], invalidregisternumber = []

        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
            
            if(!courseinfo){
                message = "Course Code was not found"
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }

            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                
                if(!studentinfo){
                    message = "Student register number was not found"
                    success = false
                    invalidregisternumber.push(student.register)
                    continue
                }
               
                const foundenrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
               
                if(foundenrollmentdata){
                    message = "These Students have already enrolled for given courses"
                    success = false
                    // invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
                const enrollmentdata = {
                    enrolled : true,
                    approval : 4
                }

                enrollmentdata.type = "normal"
                enrollmentdata.courseCode = courseinfo._id
                enrollmentdata.studentId = studentinfo._id
                enrollmentdata.batch = studentinfo.batch
                enrollmentdata.regulation = studentinfo.regulation
                if(courseinfo.category =="PE" || courseinfo.category=="OE"){
                    // console.log(course.electiveType)
                    enrollmentdata.courseCategory = course.electiveType
                }else{
                    enrollmentdata.courseCategory = courseinfo.category
                }
                enrollmentdata.semester = studentinfo.currentSemester
                enrollmentdata.branch = studentinfo.branch

                if(studentinfo.currentSemester%2==0){
                    enrollmentdata.semType="even"
                }else{
                    enrollmentdata.semType="odd"
                }
                
                const newenrollmentdata = new EnrollmentModel(enrollmentdata)
                 
                const result = await newenrollmentdata.save()
                
                if(!result){
                    message = "Unable to save the changes"
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
            }
        }
       
        if(!success){
            res.status(200).json({success:success,message:message,invalidCourseCode,invalidregisternumber})
        }
        else{
            res.status(200).json({success:success,message:message})
        }
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

// Remove students from enrollment(i.e: The doc will be completely removed)
export const CE_Admin_removestudents = async(req, res) => {
    try{

        const {courses} = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = []
        let invalidregisternumber = []

        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
           
            
            if(!courseinfo){
                message = "Course Code was not found"
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }

            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                
                if(!studentinfo){
                    message = "Student register number was not found"
                    success = false
                    invalidregisternumber.push(student.register)
                    continue
                }
               
                const foundenrollmentdata = await EnrollmentModel.findOneAndDelete({courseCode:courseinfo._id,studentId:studentinfo._id})
                console.log(foundenrollmentdata)
               
            }
        }
       
        if(!success){
            res.status(200).json({success:success,message:message,invalidCourseCode,invalidregisternumber})
        }
        else{
            res.status(200).json({success:success,message:message})
        }
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


/////////////////////// RESULT MODULE ///////////////////////

// Display students
export const Result_Admin_GetResults = async(req, res) => {
    try{
        
        const registeredStudents =[]
        await ExternalsModel.find({batch:{$in:req.body.batch},branch:{$in:req.body.branch}}).populate("studentId courseId").then(data => {
        data.map((d,k)=>{
            // console.log(d.courseId)
            registeredStudents.push({curriculumId:d.courseId._id,studentId:d.studentId._id})
        })
        // console.log(registeredStudents)
        // for(let dat of data){
            //     console.log(dat.courseId._id)
            // }
        // registeredStudents.push({curriculumId:data.courseId._id,studentId:data.studentId._id})
    })
    let results = []
    for(let each of registeredStudents){
        const enrollmentdata = await EnrollmentModel.findOne({studentId:each.studentId,courseCode:each.curriculumId,semester:{$in:req.body.sem}}).populate("studentId courseCode")
        console.log(enrollmentdata)
        if(enrollmentdata){
            await ExternalsModel.find({studentId:enrollmentdata.studentId,courseId:enrollmentdata.courseCode._id}).populate("studentId courseId").then(data => {
                data.map((d,k)=>{
                    results.push(d)
                })
            })
        }
    }
        console.log(results.length)
        
        // console.log(students)
        // console.log(dbresults)
        
    
        res.status(200).json({success:true,message:"success",results})
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"wrong"})
    }
}

// Upload students
export const Result_Admin_Upload =async(req, res)=>{
    try{
        let file = req.files.data
        // console.log(req.files.result)
        let load = await excelToJson(file)
        // console.log(load)
        let cnt=0
            for(let student of load){
                cnt++
                const studentinfo = await StudentsModel.findOne({register:student.register})
                if(studentinfo){
                    // console.log(studentinfo)
                    const courseincurriculumm = await CurriculumModel.findOne({courseCode:student.courseCode})
                    // const courseincurriculumm = await EnrollmentModel.find({courseCode:student.courseCode}).populate("studentId courseCode")
                    
                    if(courseincurriculumm){
                        const externalsData = await ExternalsModel.findOne({studentId:studentinfo._id,courseId:courseincurriculumm._id})
                        //console.log(externalsData)
                        if(!externalsData){
                            //////new data
                            const Studentdata = {
                                studentId:studentinfo._id,
                                courseId:courseincurriculumm._id,
                                attempt:student.attempt,
                                result:student.result
                            }
                            const studata = new ExternalsModel(Studentdata)
                            const result = await studata.save()
                            console.log(result)
                            if(student.result == "P"){
                                const enrollmentData = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculumm._id})
                                if(enrollmentData){
                                    enrollmentData.type="normal"
                                    await enrollmentData.save()
                                    // continue
                                }
                            }
                            if(student.result == "RA"){
                                const enrollmentData = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculumm._id})
                                if(enrollmentData){
                                    enrollmentData.type="RA"
                                    await enrollmentData.save()
                                    // console.log(res)
                                    
                            }
                        }
                        if(student.result == "SA"){
                            const enrollmentData = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculumm._id})
                            if(enrollmentData){
                                enrollmentData.type="SA"
                                await enrollmentData.save()
                                // console.log(res)
                                
                            }
                        }
                    }   
                        else{
                            // console.log(student.attempt)
                            externalsData.attempt = student.attempt
                            externalsData.result = student.result
                            await externalsData.save()
                            // console.log(res) 
                            if(student.result == "RA"){
                                const enrollmentData = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculumm._id})
                                if(enrollmentData){
                                    enrollmentData.type="RA"
                                    await enrollmentData.save()
                                    // console.log(res)
                                    
                                }
                            }
                            if(student.result == "SA"){
                                const enrollmentData = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculumm._id})
                                if(enrollmentData){
                                    enrollmentData.type="SA"
                                    await enrollmentData.save()
                                    // console.log(res)
                                    
                                }
                            }
                            if(student.result == "P"){
                                const enrollmentData = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculumm._id})
                                if(enrollmentData){
                                    enrollmentData.type="normal"
                                    await enrollmentData.save()
                                    // continue
                                }
                            }
                        }
                    }
                    else{
                        ///course code not available in database
                        console.log("Coursecode was not in curriculum database")
                    }
                }
                else{
                    ////register number not availalbe in database
                    console.log("Student register number is not in Students database")
                }
            }
            console.log(cnt)
            res.status(200).json({success:true, msg:"Results pushed into database"})
        }
    catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


/////////////////////// REGISTRATION MODULE ///////////////////////

// Fetch and send registered students list..
export const CR_Admin_getRegisteredstudentslist = async(req, res) => {
    try{
        const { batch, sem, branch } = req.body
        
        const data = await EnrollmentModel.find({batch:batch, branch:{$in:branch},semester:{$in:sem},enrolled:true,approval:{$in:[-14,-13,-12,-11,10,11,12,13,14]}}, {courseCode:1,studentId:1,branch:1,enrolled:1,approval:1,_id:0}).populate("courseCode", {courseCode:1,title:1}).populate("studentId",{firstName:1,register:1,branch:1,batch:1})     
             
        let result = []
        for(let doc of data) {
            let flag = result.some(rdoc =>  rdoc.courseCode == doc.courseCode.courseCode)
            if(flag) continue
            
            const obj = {
                courseCode: doc.courseCode.courseCode,
                courseTitle: doc.courseCode.title,
                students: data.filter(ndoc => ndoc.courseCode.courseCode == doc.courseCode.courseCode && { registerNumber: doc.studentId.register, StudentName: doc.studentId.firstName })
            }
            result.push(obj)
        }
   
        let courses = []
        for(let i of result){
            let nstudents = []
            let studentcount = 0
            for(let student of i.students){
                
                studentcount = studentcount + 1
                const nstudent = {
                    registernumber : student.studentId.register,
                    studentname : student.studentId.firstName,
                    branch : student.studentId.branch,
                    batch : student.studentId.batch,
                    enrolled : student.enrolled,
                    approval : student.approval
                }
                nstudents.push(nstudent)
            }
            const course = {
                courseCode : i.courseCode,
                courseTitle: i.courseTitle,
                studentsenrolled:studentcount,
                studentsList:nstudents
            }
            courses.push(course)
        }

        res.status(200).json(courses)
        
        //     enrollmentdata.forEach(groupdata)
        // //    finaldetails
        
        //     function groupdata(eachcourse){
            
            //         const course = {
                //            courseCode : eachcourse.courseCode.courseCode,
                //            courseTitle: eachcourse.courseCode.title,
                //         //    studentsEnrolled:
    //             studentsList:[{sturegnum:eachcourse.studentId.register,studentname:eachcourse.studentId.firstName}]
    //         }
    //         courses.push(course)

    //         // return courses
    //     }
        // console.log(courses)
        //     res.status(200).json({success:true,message:"Enrolled student details are fetched",totalcourse:enrollmentdata.length,courses})
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

// Approve registered students
export const CR_Admin_approvestudents = async(req, res) => {
    try{
        const {courses} = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = []
        let invalidregisternumber = []

        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
           
            if(!courseinfo){
                message = "Course Code was not found"
                console.log(message)
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }
            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                
                if(!studentinfo){
                    message = "Student register number was not found"
                    console.log(message)
                    success = false
                    
                    invalidregisternumber.push(student.register)
                    continue
                }
               
                const enrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
               
                if(!enrollmentdata){
                    message = "These Students have not enrolled for given courses"
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }

                if(enrollmentdata.approval == 14 && enrollmentdata.enrolled){
                    message = "These students are already enrolled && approved"
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }

                if(student.approval == -14){
                    enrollmentdata.approval = -14
                }
                
                if(student.approval == 14){
                    enrollmentdata.approval = student.approval
                }

                const result = await enrollmentdata.save()
                
                if(!result){
                    message = "Unable to save the changes"
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
            }
        }
       
        if(!success){
            res.status(200).json({success:success,message:message,invalidCourseCode,invalidregisternumber})
        }
        else{
            res.status(200).json({success:success,message:message})
        }
  
        
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

// Add students to the registration
export const CR_Admin_addstudents = async(req, res) => {
    try{
        const {courses} = req.body

        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = [], invalidregisternumber = []

        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
            
            if(!courseinfo){
                message = "Course Code was not found"
                console.log(message)
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }

            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                
                if(!studentinfo){
                    message = "Student register number was not found"
                    console.log(message)
                    success = false
                    invalidregisternumber.push(student.register)
                    continue
                }
               
                const foundenrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
               
                if(foundenrollmentdata){
                    message = student.register + "This Student have already registeredfor given course " + course.courseCode
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
                const enrollmentdata = {
                    enrolled : true,
                    approval : 14
                }

                enrollmentdata.type = "normal"
                enrollmentdata.courseCode = courseinfo._id
                enrollmentdata.batch = studentinfo.batch
                enrollmentdata.regulation = studentinfo.regulation
                enrollmentdata.courseCategory = courseinfo.category
                enrollmentdata.studentId = studentinfo._id
                enrollmentdata.semester = studentinfo.currentSemester
                enrollmentdata.branch = studentinfo.branch

                if(studentinfo.currentSemester%2==0){
                    enrollmentdata.semType="even"
                }else{
                    enrollmentdata.semType="odd"
                }

                const newenrollmentdata = new EnrollmentModel(enrollmentdata)
                 
                const result = await newenrollmentdata.save()
                
                if(!result){
                    message = "Unable to save the changes"
                    console.log(message)
                    success = false
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
            }
        }
       
        if(!success){
            res.status(200).json({success:success,message:message,invalidCourseCode,invalidregisternumber})
        }
        else{
            res.status(200).json({success:success,message:message})
        }
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

// Remove from registration
// The students will be pushed back to enrollment phase
export const CR_Admin_removestudents = async(req, res) => {
    try{

        const {courses} = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = []
        let invalidregisternumber = []

        for(let course of courses){
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
            
            
            if(!courseinfo){
                message = "Course Code was not found"
                console.log(message)
                success = false
                invalidCourseCode.push(course.courseCode)
                continue
            }

            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                
                if(!studentinfo){
                    message = "Student register number was not found"
                    console.log(message)
                    success = false
                    invalidregisternumber.push(student.register)
                    continue
                }
               
                const foundenrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
                if(foundenrollmentdata){
                    foundenrollmentdata.approval = 4
                    await foundenrollmentdata.save().then(p=>console.log(p))
                }else{
                    console.log("The enrollment Collection was not found for student" + studentinfo.register + " for coursecode: "+ courseinfo.courseCode)
                }
                // console.log(foundenrollmentdata)
               
            }
        }
       
        if(!success){
            res.status(200).json({success:success,message:message,invalidCourseCode,invalidregisternumber})
        }
        else{
            res.status(200).json({success:success,message:message})
        }
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////


