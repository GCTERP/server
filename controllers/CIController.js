///////////////////////  ADMIN MODULE ///////////////////////

import { MasterTimetableModel } from "../models/MasterTimetableModel.js";
import { SemesterMetadataModel } from "../models/SemesterMetadataModel.js";
import { CurriculumModel } from "../models/CurriculumModel.js";
import { AttendanceModel } from "../models/AttendanceModel.js";
import { EnrollmentModel } from "../models/EnrollmentModel.js";
import { CourseDetailsModel } from "../models/CourseDetailsModel.js";
import { StudentsModel } from "../models/StudentsModel.js";
import { FacultyModel } from "../models/FacultyModel.js";
import { RequestsModel } from "../models/RequestsModel.js";

///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////


export const demo = async (req,res) => {
    try{
        res.status(200).json(await EnrollmentModel.find({}));
    } catch(err) { res.status(400).send("Request Failed: " + err.message); }
}


//Completed...
export const getMasterAttendance = async (req, res) => {

    try {

        let { branch, facultyId } = req.query;

        //Get Current Batch Start and End Date
        let sem_dates = await SemesterMetadataModel.find({}, { batch: 1, sem: 1, semester: 1 }).sort({ date: -1 }).limit(3);

        console.log(sem_dates)
        //Overall Start and End Date Calculation
        let start_date = new Date();
        let end_date = new Date('01-01-2070');
        sem_dates = sem_dates.map(item => item.toObject())
        for (let i of sem_dates) {
            console.log("zerrrrr", i.semester.begin)
            if (start_date > i.semester.begin) {
                start_date = i.semester.begin
            }
            if (end_date > i.semester.end) {
                end_date = i.semester.end
            }
        }

        let today = new Date();
        if (end_date > today) {
            end_date = today
        }

        console.log(start_date);
        console.log(end_date);

        //Get Periods from MasterTimetable
        let result = await MasterTimetableModel.find({ branch: branch, facultyId: facultyId, date: { $gte: start_date, $lte: end_date } }, { date: 1, courseId: 1, period:1, freeze:1 }).populate("courseId", { courseId: 1, courseCode: 1, batch:1, branch:1, semester:1 })
        await CurriculumModel.populate(result, { path: "courseId.courseId", select: { courseCode: 1, title: 1 } })

        //Regularize data for front-end
        result = result.map(period => (period.toObject()));
        for (let period of result) {
            period.courseCode = period.courseId.courseCode;
            period.courseName = period.courseId.courseId.title;
            period.batch = period.courseId.batch;
            period.branch = period.courseId.branch;
            period.semester = period.courseId.semester;
            period.courseId = period.courseId._id;
        }
        console.log(result)
        res.status(200).send(result);

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


//Completed
export const getAttendance = async (req, res) => {

    try {

        let { _id, courseId } = req.query

        //Fetch Attendance from if already done
        let result = await AttendanceModel.find({ masterTimetableId: _id }, { studentId: 1, present: 1, onduty: 1 }).populate({path:"studentId", select:{ register: 1, firstName: 1, lastName: 1 } })
        console.log(result)
        //If no Data, fetch from enrollment 
        if (result.length == 0) {

            result = await EnrollmentModel.find({ courseId: courseId }, { _id: 0, studentId: 1 }).populate({path:"studentId", select:{ register: 1, firstName: 1, lastName: 1 } })
            
            //Regularize Data for front-end
            result = result.map(student => (student.toObject()));
            for (let student of result) {
                student.masterTimetableId = _id;
                student.name = student.studentId.firstName + " " + student.studentId.lastName;
                student.register = student.studentId.register
                student.studentId = student.studentId._id
                student.present = true
                student.onduty = false
            }

        } else {

            //Regularize data for front-end
            result = result.map(student => (student.toObject()));
            for (let student of result) {
                student.name = student.studentId.firstName + " " + student.studentId.lastName;
                student.register = student.studentId.register
                student.studentId = student.studentId._id
            }

        }

        result.sort((a, b) => {
            if (a.register < b.register) {
                return -1;
            }
            if (a.register > b.register) {
                return 1;
            }
            return 0;
        })
        
        res.status(200).json(result);

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


export const dropPeriod = async (req,res) => {

    try{

        let { _id } = req.query

        await AttendanceModel.deleteMany({masterTimetableId:_id})

        await MasterTimetableModel.deleteMany({_id:_id})

        res.status(200).send("Delete Successful")

    } catch(err) { res.status(400).send("Request Failed: " + err.message); }

}

//Completed
export const postAttendance = async (req, res) => {

    try {

        console.log("hello world")
        let data = req.body;
        let attendance = []

        //Get Period Data...
        let period = await MasterTimetableModel.find({ _id: data[0].masterTimetableId }).populate("courseId", { courseCode: 1 })

        console.log(period)
        //Iterate over each Student
        for (let student of data) {

            //Check if Id is there...
            if (student.hasOwnProperty("_id"))
                await AttendanceModel.updateOne({ _id: student._id }, { present: student.present, onduty: student.onduty })
            else {

                //Create a new Entry in AttendanceModel
                let temp = {
                    studentId: student.studentId,
                    masterTimetableId: period[0]._id,
                    courseId: period[0].courseId._id,
                    courseCode: period[0].courseId.courseCode,
                    branch: period[0].branch,
                    batch: period[0].batch,
                    date: period[0].date,
                    period: period[0].period,
                    present: student.present,
                    onduty: student.onduty
                }

                attendance.push({ ...temp })
            }
        }

        //Create Entries if needed..
        if (attendance.length != 0) {
            await AttendanceModel.insertMany(attendance)
        }

        //Change boolean to attendance marked...
        await MasterTimetableModel.updateOne({ _id: data[0].masterTimetableId }, { marked: true })

        res.status(200).send("Updated Successfully")

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


//Completed
export const getCourses = async (req, res) => {

    try {

        let { facultyId } = req.query
        let result = {}

        //Get Current Batch Start and End Date
        let sems = await SemesterMetadataModel.find({}, { batch: 1, sem: 1, semester: 1 }).sort({ date: -1 }).limit(3);

        //Overall Start and End Date Calculation
        let start_date = new Date();
        let end_date = new Date('01-01-2070');

        for (let i of sems) {
            if (start_date > i.semester.begin) {
                start_date = i.semester.begin
            }
            if (end_date > i.semester.end) {
                end_date = i.semester.end
            }
        }

        let today = new Date();
        if (end_date > today) {
            end_date = today
        }

        result.start_date = start_date;
        result.end_date = end_date;

        //Get Courses Handled this semester
        result.courses = await CourseDetailsModel.find({ facultyId: facultyId, $or: [{ semester: sems[0].sem, batch: sems[0].batch }, { semester: sems[1].sem, batch: sems[1].batch }, { semester: sems[2].sem, batch: sems[2].batch }] }, { semester: 1, courseCode: 1, batch: 1, branch: 1 }).populate("courseId", { _id: 0, title: 1 })
        result.courses = result.courses.map(course => (course.toObject()))
        console.log(result)

        //Regularize Data for front-end
        for (let course of result.courses) {
            course.courseName = course.courseId.title
            delete course.courseId
        }

        res.status(200).json(result)

    } catch (err) { res.status(400).send("Request Failed: " + err.message); }

}


//Completed...
export const getAttendancePercent = async (req, res) => {

    try {

        let { courseId, start_date, end_date } = req.query
        start_date = new Date(start_date)
        end_date = new Date(end_date)

        //Take report using group-by studentId
        let data = await AttendanceModel.aggregate(
            [
                {
                    $match: {
                        $expr: {
                            $eq: ['$courseId', { $toObjectId: courseId }]
                        },
                        date: {
                            $gte: start_date,
                            $lte: end_date
                        }
                    }
                },
                {
                    "$project": {
                        studentId: 1,
                        presented: {
                            $cond: [{ $eq: ["$present", true] }, 1, 0]
                        },
                    }
                },
                {
                    $group: {
                        _id: "$studentId",
                        total: { $count: {} },
                        present: { $sum: "$presented" }
                    }
                },
                {
                    $sort:{
                        _id:1
                    }
                }
            ]
        )

        //Get Student Details...
        await StudentsModel.populate(data, { path: "_id", select: { register: 1, firstName: 1, lastName: 1 } })

        //Regularize data for front-end
        for (let student of data) {
            student.register = student._id.register

            student.name = student._id.firstName + " " +student._id.lastName
            student.Total = student.total
            student.Present = student.present
            student.percent = student.present/student.total * 100
            
            delete student._id
            delete student.total
            delete student.present
        }

        res.status(200).json(data)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }

}


//Completed...
export const getStaffTimetable = async (req, res) => {

    try {

        let { facultyId } = req.query

        //Get All Periods...
        
        let data = await MasterTimetableModel.find({facultyId:facultyId}, {date:1, period:1}).sort({date:1,period:1}).populate("courseId", {courseId:1, courseCode:1})
        await CourseDetailsModel.populate(data, {path:"courseId.courseId", select:{title:1}})

        //Regularize data for front-end
        data = data.map(student => (student.toObject()));
        for (let period of data) {
            period.courseCode = period.courseId.courseCode
            period.courseName = period.courseId.courseId.title
            delete period.courseId
        }

        res.status(200).json(data)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }

}


//Completed...
export const getStudentTimetable = async (req, res) => {

    try {

        let data = {}
        let { branch } = req.query

        //Get Current Batch and Semester...
        let sems = await SemesterMetadataModel.find({}, { _id: 0, sem: 1, batch: 1 }).sort({ date: -1 }).limit(3)
        data.sems = sems

        //Get All Periods of All Classes...
        data.period = await MasterTimetableModel.find({ branch: branch, $or: [{ semester: sems[0].sem, batch: sems[0].batch }, { semester: sems[1].sem, batch: sems[1].batch }, { semester: sems[2].sem, batch: sems[2].batch }] }, { batch: 1, branch: 1, semester: 1, date: 1, period: 1 }).populate("courseId", { courseId: 1, courseCode: 1 })
        await CourseDetailsModel.populate(data.period, { path: "courseId.courseId", select: { title: 1 } })

        //Regularize data for front-end
        data.period = data.period.map(student => (student.toObject()));
        for (let period of data.period) {
            period.courseCode = period.courseId.courseCode
            period.courseName = period.courseId.courseId.title
            delete period.courseId
        }

        res.status(200).json(data)

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }

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
        if (profile.hod == true) {
            staff = await FacultyModel.find({ admin: true }, { _id: 1 })
            toId = staff[0]._id
        }
        else {
            staff = await FacultyModel.find({ branch: profile.branch, hod: true }, { _id: 1 })
            toId = staff[0]._id
        }

        res.status(200).json({ ...profile.toObject(), canRequest: canRequest, toId: toId })

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