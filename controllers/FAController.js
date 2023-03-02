///////////////////////  ADMIN MODULE ///////////////////////

import { EnrollmentModel } from "../models/EnrollmentModel.js";
import { SemesterMetadataModel } from "../models/SemesterMetadataModel.js";
import { MasterTimetableModel } from "../models/MasterTimetableModel.js";
import { AttendanceModel } from "../models/AttendanceModel.js";
import { CourseDetailsModel } from "../models/CourseDetailsModel.js";
import { CurriculumModel } from "../models/CurriculumModel.js";
import { StudentsModel } from "../models/StudentsModel.js";
import { StudentDetailsModel } from "../models/StudentDetailsModel.js";
import { RequestsModel } from "../models/RequestsModel.js";
import { FacultyModel } from "../models/FacultyModel.js";

///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////


export const demo = async (req, res) => {
    try {
        res.status(200).json(await MasterTimetableModel.find({ _id: "63faea970fbbb6e187cba951" }))
    } catch (err) { res.status(400).send("Failed: " + err.message) }
}

//Completed
export const getAttendance = async (req, res) => {

    try {

        let result = []
        let { date, batch, branch } = req.query

        //Get all periods of the day..
        let data = await MasterTimetableModel.find({ date: date, batch: batch, branch: branch }, { marked: 1, period: 1, courseId: 1, branch: 1, batch: 1 }).populate("courseId", { courseId: 1, courseCode: 1 })
        await CurriculumModel.populate(data, { path: "courseId.courseId", select: { title: 1 } })
        data = data.map(period => (period.toObject()))

        //Iterate for each period...
        for (let period of data) {
            console.log(period)
            //Check if Data exist...
            if (period.marked == 0) {

                //Get data from EnrollmentModel
                let students = await EnrollmentModel.find({ courseId: period.courseId, batch: batch, branch: branch }, { _id: 0, studentId: 1, courseId: 1 }).populate("studentId", { register: 1, firstName: 1, lastName: 1 })
                students = students.map(student => student.toObject())

                //Regularize data for front-end
                //Sending all data to push easier at save...
                for (let student of students) {
                    student.masterTimetableId = period._id
                    student.courseCode = period.courseId.courseCode
                    student.courseName = period.courseId.courseId.title
                    student.branch = period.branch
                    student.batch = period.batch
                    student.register = student.studentId.register
                    student.studetName = student.studentId.firstName + " " + student.studentId.lastName
                    student.studentId = student.studentId._id
                    student.date = date
                    student.period = period.period
                    student.present = true
                    student.onduty = false
                    result.push({ ...student })
                }

            } else {

                //Get exist data...
                let students = await AttendanceModel.find({ batch: batch, branch: branch, date: date, period: period.period }).populate("studentId", { register: 1, firstName: 1, lastName: 1 })
                students = students.map(student => student.toObject())
                for (let student of students) {
                    student.register = student.studentId.register
                    student.studentName = student.studentId.firstName + " " + student.studentId.lastName
                    student.studentId = student.studentId._id
                    result.push({ ...student })
                }

            }

        }

        res.status(200).json(result);

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


//Completed
export const postAttendance = async (req, res) => {

    try {

        let data = req.body
        let result = []

        //Iterate over each student
        for (let student of data) {

            //Check if Document exist
            if (student.hasOwnProperty("_id")) {
                await AttendanceModel.updateOne({ _id: student._id }, { present: student.present, onduty: student.onduty })
            } else {
                delete student.courseName
                delete student.studentName
                delete student.register
                result.push({ ...student })
            }

        }

        //Create new entries if needed
        if (result.length != 0) {
            await AttendanceModel.insertMany(result);
        }

        await MasterTimetableModel.updateMany({ branch: data[0].branch, batch: data[0].batch, date: data[0].date }, { marked: true })

        res.status(200).send("Update Successful")

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


//Completed...
export const getAttendanceReport = async (req, res) => {

    try {

        let { start_date, end_date, branch, batch } = req.query
        start_date = new Date(start_date)
        end_date = new Date(end_date)
        batch = parseInt(batch)

        //Take report using group-by studentId
        let data = await AttendanceModel.aggregate(
            [
                {
                    "$match": {
                        branch: branch,
                        batch: batch,
                        date: {
                            $gte: start_date,
                            $lte: end_date
                        }
                    },
                },
                {
                    "$project": {
                        studentId: 1,
                        courseId: 1,
                        batch: 1,
                        presented: {
                            $cond: [{ $eq: ["$present", true] }, 1, 0]
                        },
                    }
                },
                {
                    $group: {
                        _id: {
                            "studentId": "$studentId",
                            "courseId": "$courseId"
                        },
                        total: { $count: {} },
                        present: { $sum: "$presented" },
                    }
                }

            ]
        )

        await StudentsModel.populate(data, { path: "_id.studentId", select: { register: 1, firstName: 1, lastName: 1 } })
        await CourseDetailsModel.populate(data, { path: "_id.courseId", select: { courseId: 1, courseCode: 1 } })
        await CurriculumModel.populate(data, { path: "_id.courseId.courseId", select: { title: 1 } })

        //Regularize data for front-end
        for (let student of data) {
            student.register = student._id.studentId.register,
                student.studentName = student._id.studentId.firstName + " " + student._id.studentId.lastName
            student.courseCode = student._id.courseId.courseCode
            student.courseName = student._id.courseId.courseId.title
            student.percent = student.present / student.total * 100
            delete student._id
        }

        res.status(200).json(data)

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



/////////////////////// PROFILE ///////////////////////
export const getProfile = async (req, res) => {

    try {

        let { facultyId } = req.query, toId = null, staff = null
        //Get the fa details
        let profile = await FacultyModel.find({ _id: facultyId }, { __v: 0, createdAt: 0, updatedAt: 0 })
        profile = profile[0]
    
        //checking whether the fa has made any request
        let isRequestMade = await RequestsModel.find({ from: facultyId }, { done: 1 })

        //storing whether the fa can make request or not
        let canRequest = (isRequestMade) ? true : false

        //checking whether the ci is also a hod
        if(profile.hod==true){
            staff = await FacultyModel.find({ admin: true }, { _id: 1 })
            toId = staff[0]._id
        }
        else{
            staff = await FacultyModel.find({ branch: profile.branch, hod: true }, { _id: 1 })
            toId = staff[0]._id
        }

        res.status(200).json({...profile.toObject(), canRequest: canRequest, toId: toId })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }

}


/////////////////////// REQUEST MODULE ///////////////////////
export const profileRequest = async (req, res) => {

    try {

        let request = req.body

        await RequestsModel.create(request)

        res.status(200).send("Requested successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const updateStudentProfile = async (req, res) => {

    try {

        let data = req.body

        if (data.approved) {

            await StudentsModel.updateOne({ _id: data.from }, data.body)
            await StudentDetailsModel.updateOne({ studentId: data.from }, data.body)

        }

        data.done = true

        let id = data._id

        delete data._id

        await RequestsModel.updateOne({ _id: id }, data)

        res.status(200).send("Request updated successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }

}

export const getRequests = async (req, res) => {

    try {

        let { facultyId } = req.query

        let data = await RequestsModel.find({ to: facultyId }, { __v: 0, createdAt: 0, updatedAt: 0 }).sort({createdAt: 'desc'})

        res.status(200).json(data)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }

}