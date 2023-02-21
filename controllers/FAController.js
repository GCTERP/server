///////////////////////  ADMIN MODULE ///////////////////////

import { EnrollmentModel } from "../models/EnrollmentModel.js";
import { SemesterMetadataModel } from "../models/SemesterMetadataModel.js";
import { MasterTimetableModel } from "../models/MasterTimetableModel.js";
import { AttendanceModel } from "../models/AttendanceModel";
import { CourseDetailsModel } from "../models/CourseDetailsModel.js";
import { CurriculumModel } from "../models/CurriculumModel.js";

///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////
export const getAttendance = async (req,res) => {
    try{
        let { date, batch, branch } = req.query
        result = []
        let data = await MasterTimetableModel.find({date:date,batch:batch,branch:branch}, {marked:1,period:1,courseId:1})
        data = data.map(period => ( period.toObject() ) )
        for(let period of data){
            if (period.marked==0){
                let students = await EnrollmentModel.find({courseId:courseId, batch:batch, branch:branch}, {_id:0, studentId:1,courseId:1, batch:1, branch:1}).populate("studentId", {register:1, firstName:1, lastName:1})
                for(let student of students){
                    student.register = student.studentId.register
                    student.name = student.studentId.firstName+" "+student.studentId.lastName
                    student.studentId = student.studentId._id
                    student.date = date
                    student.period = period.period
                    student.present = false
                    student.onduty = false
                    result.push({...student})
                }
            }else{
                let students = await AttendanceModel.find({batch:batch, branch:branch, date:date, period:period.period}).populate("studentId", {register:1, firstName:1, lastName:1})
                for(let student of students){
                    student.register = student.studentId.register
                    student.name = student.studentId.firstName+" "+student.studentId.lastName
                    student.studentId = student.studentId._id
                    result.push({...student})
                }
            }
        }
        res.status(200).json(result);
    } catch(err) { res.status(400).send("Request Failed: " + err.message); }
}

export const postAttendance = async (req,res) => {
    try{
        let {data} = req.body
        let result = []
        for(let student of period){
            if(student.hasOwnProperty("_id")){
                await AttendanceModel.updateOne({_id:student._id}, {present:student.present, onduty:student.onduty})
            }else{
                result.push({...student})
            }
            if(result.length!=0){
                await AttendanceModel.insertMany(result);
            }
        }
        res.status(200).send("Update Successful")
    } catch(err) { res.status(400).send("Request Failed: " + err.message); }
}


export const getAttendanceReport = async (req,res) => {
    try{
        let {datefrom, dateto, branch, batch } = req.query
        let data = await AttendanceModel.aggregate(
            [
                {
                    "$match": {
                        branch:branch,
                        batch:batch,
                        date:{
                            $gte: start_date,
                            $lte:end_date
                        }
                    },
                },
                {
                    $group:{
                        _id:{
                            "studentId":"$studentId",
                            "courseId":"$courseId"
                        },
                        total:{$count:{}},
                        present:{$count: {present:"true"} }
                    }
                }

            ]
        )
        await StudentsModel.populate(data, {path:"_id.studentId", select:{register:1, firstName:1, lastName:1}})
        await CourseDetailsModel.populate(data, {path:"_id.courseId", select:{courseId:1, courseCode:1}})
        await CurriculumModel.populate(data, {path:"_id.courseId.courseId", select:{title:1}})
        //needed Regularization (No Data)

        res.status(200).json(data)
    } catch(err) { res.status(400).send("Request Failed: " + err.message); }
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


