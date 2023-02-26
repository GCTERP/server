///////////////////////  ADMIN MODULE ///////////////////////

import { MasterTimetableModel } from "../models/MasterTimetableModel.js";
import { SemesterMetadataModel } from "../models/SemesterMetadataModel.js";
import { CurriculumModel } from "../models/CurriculumModel.js";
import { AttendanceModel } from "../models/AttendanceModel.js";
import { EnrollmentModel } from "../models/EnrollmentModel.js";
import { CourseDetailsModel } from "../models/CourseDetailsModel.js";
import { StudentsModel } from "../models/StudentsModel.js";

///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////

export const demo = async (req,res) => {
    try{
        res.status(200).json(await StudentsModel.find({}));
    } catch(err) { res.status(400).send("Request Failed: " + err.message); }
}

export const getMasterAttendance = async (req,res) => {
    try{
        let {branch, facultyId} = req.query;
        let sem_dates = await SemesterMetadataModel.find({}, {semester:1}).sort({date:-1}).limit(3);
        let start_date = new Date();
        let end_date = new Date('01-01-2070');
        for(let i of sem_dates){
            console.log("start date = ", start_date)
            console.log("end date = ", end_date)
            if (start_date > i.semester.begin) {
                start_date = i.semester.begin
            }
            if(end_date > i.semester.end){
                end_date = i.semester.end
            }
        }

        let today = new Date();
        if(end_date>today){
            end_date = today
        }


        console.log(start_date);
        console.log(end_date);

        let result = await MasterTimetableModel.find({ branch:branch, facultyId:facultyId, date:{$gte:start_date, $lte:end_date} }, {date:1, courseId:1}).populate("courseId",{courseId:1, courseCode:1})
        await CurriculumModel.populate(result, {path:"courseId.courseId", select: {courseCode:1, title:1}})
        result = result.map( period => ( period.toObject() ));
        for(let period of result){
            console.log(period)
            period.courseCode = period.courseId.courseCode;
            period.courseName = period.courseId.courseId.title;
            period.courseId = period.courseId._id;
        }
        res.status(200).send(result);
    } catch(err) { res.status(400).send("Request Failed: " + err.message); }
}

export const getAttendance = async (req,res) => {
    
    try{

        let { _id, courseId } = req.query
        let result = await AttendanceModel.find({ masterTimetableId:_id }, { studentId:1, present:1, onduty:1 }).populate("studentId", { register:1, firstName:1, lastName:1 })
        if (result.length == 0){
            result = await EnrollmentModel.find({courseId:courseId}, {_id:0, studentId:1}).populate("studentId", { register:1, firstName:1, lastName:1 })
        }
        result = result.map( student => ( student.toObject() ));
        for(let student of result){
            student.masterTimetableId = _id
            student.name = student.studentId.firstName+" "+student.studentId.lastName;
            student.register = student.studentId.register
            student.studentId = student.studentId._id
        }
        res.status(200).json(result);
        
    } catch(err) { res.status(400).send("Request Failed: " + err.message); }
}

export const postAttendance = async (req,res) => {
    
    try{
        let { data } = req.query;
        let attendance = []
        for(let student of data){
            if(student.hasOwnProperty("_id"))
                await AttendanceModel.updateOne( { _id:student._id }, { present:student.present, onduty:student.onduty } )
            else{
                let period = await MasterTimetableModel.find({_id:student.masterTimetableId})
                let temp = {
                    studentId: student.studentId,
                    masterTimetableId:period._id,
                    courseId: period.courseId,
                    courseCode:"",
                    branch:period.branch,
                    date: period.date,
                    period:period.period,
                    present:student.present,
                    onduty:student.onduty
                }
                attendance.push({...temp})
            }
        }
        if(attendance.length!=0){
            await AttendanceModel.insertMany(attendance)
        }
        res.status(200).send("Updated Successfully")

    } catch(err) { res.status(400).send("Request Failed: " + err.message); }
}

export const getCourses = async (req,res) => {
    try{
        let { facultyId } = req.query
        let result  = await CourseDetailsModel.find({facultyId:facultyId}, {semester:1, courseCode:1, batch:1, branch:1 }).populate("courseId", {_id:0, title:1})
        result = result.map(course => ( course.toObject() ) )
        console.log(result)
        for(let course of result){
            course.courseName = course.courseId.title
            delete course.courseId
        }  
        res.status(200).json(result)
    } catch(err) {res.status(400).send("Request Failed: " + err.message); }
}


export const getAttendancePercent = async (req,res) =>{
    try{
        let { courseId, start_date, end_date } = req.query
        let data = await AttendanceModel.aggregate(
            [
                {
                    "$match": {
                        courseId:courseId,
                        date:{
                            $gte:start_date, 
                            $lte:end_date
                        }
                    }
                }, 
                {
                    $group:{
                        _id:{"studentId":"$studentId"}, 
                        total:{ $count: {}}, 
                        present:{$count:{ present:"true"} }
                    }
                }
            ]
        )
        await StudentsModel.populate(data, {path:"_id.studentId", select:{register:1, firstName:1, lastName:1}})
        //needed Regularization (No Data)...
        
        res.status(200).json(data)
        
    } catch(err) { res.status(400).send("Request Failed: " + err.message) }
}

export const getdata = async (req,res) =>{
    try{
        //  let data = await excelToJson()
        //  console.log(data.length)
        //  await EnrollmentModel.insertMany(data);
        res.status(200).json(await EnrollmentModel.find({branch:"Information Technology", batch:2019}).populate("courseCode",{title:1, courseCode:1}).populate("studentId",{register:1, firstName:1, lastName:1}));
        
    } catch(err) { res.status(400).send("Request Failed: " + err.message) }
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


