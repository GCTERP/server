///////////////////////  ADMIN MODULE ///////////////////////
import { EnrollmentModel } from '../models/EnrollmentModel.js'
import { StudentsModel } from '../models/StudentsModel.js'
import { EnrollmentModel } from "../models/EnrollmentModel.js";
import { SemesterMetadataModel } from "../models/SemesterMetadataModel.js";
import { MasterTimetableModel } from "../models/MasterTimetableModel.js";
import { AttendanceModel } from "../models/AttendanceModel.js";
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

// fetch enrolled students list to FA 
export const enrollment_FA_GetEnrolledStudentsList = async(req, res) => {
    try{
        // replace this later based on user
        const  batch = 2023 
        const sem = 8
        const branch = "CSE"

        const enrollmentstatus = await SemesterMetadataModel.findOne({semester:{sem:sem,batch:batch}})
      
        if(enrollmentstatus.enrollment.status == 'Active'){
        
        const data = await EnrollmentModel.find({branch:branch,semester:sem}, {courseCode:1,studentId:1,branch:1,enrolled:1,approval:1,_id:0})
        .populate("courseCode", {courseCode:1,title:1}).populate("studentId",{firstName:1,register:1,branch:1,batch:1})     

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
        
        }else{
            res.status(200).json({success:false, message:"Enrollment is not enabled"})
        }
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


export const enrollment_FA_ApproveStudents = async(req, res) => {
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
                if(enrollmentdata.approval>1 || enrollmentdata.approval>=10){
                    success = false
                    message = "These students are already approved by higher staffs you will not be able to perform any changes"
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
                if(enrollmentdata.approval <=-2){
                    success = false
                    message = "These students are already rejected by higher staffs you will not be able to perform any changes"
                    invalidCourseCode.push(course.courseCode)
                    invalidregisternumber.push(student.register)
                    continue
                }
                enrollmentdata.approval = student.approval
                
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


/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////


