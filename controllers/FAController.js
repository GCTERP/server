///////////////////////  ADMIN MODULE ///////////////////////
import { EnrollmentModel } from '../models/EnrollmentModel.js'
import { StudentsModel } from '../models/StudentsModel.js'
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

// fetch data to feed the enrollment page 
export const CE_FA_getenrolledstudentslist = async(req, res) => {
    try{
        const { batch, sem, branch } = req.body
        
        const data = await EnrollmentModel.find({batch:batch, branch:{$in:branch},semester:{$in:sem},approval:{$in:[-4,-3,-2,-1,0,1,2,3,4,-14,-13,-12,-11,10,11,12,13,14]}}, {courseCode:1,studentId:1,branch:1,enrolled:1,approval:1,_id:0}).populate("courseCode", {courseCode:1,title:1}).populate("studentId",{firstName:1,register:1,branch:1,batch:1})     
        // console.log(data)

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


export const CE_FA_approvestudents = async(req, res) => {
    try{
        const {courses} = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = ["message : Following Course Codes was not found in curriculum"]
        let invalidregisternumber = ["message : Following Student register numbers were not found in students collection"]
        let invalid = [
            "message : Following students were approved/rejected by higher staffs. (You will not be able to perform any changes)"
        ]
        let unenrolled = [
            "message : Following Students have not enrolled for given courses"]

        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
        
            if(!courseinfo){
                success = false
                const objc = {
                    courseCode:course.courseCode
                }
                invalidCourseCode.push(objc)
                continue
            }
            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                const obj = {}
                if(!studentinfo){

                    success = false
                    const objs = {
                        register: student.register,
                    }
                    invalidregisternumber.push(objs)
                    continue
                }
               
                const enrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
               
                if(!enrollmentdata){
                    const objs = {
                        register: student.register,
                        courseCode: course.courseCode
                    }
                    unenrolled.push(objs)
                    success = false
                    // invalidCourseCode.push(course.courseCode)
                    // invalidregisternumber.push(student.register)
                    continue
                }
                if(enrollmentdata.approval>1 && enrollmentdata.approval<=14){
                    success = false
                    
                    obj.register= student.register
                    obj.courseCode= course.courseCode
                    obj.status="approved"
                    
                    invalid.push(obj)
                    // invalidCourseCode.push(course.courseCode)
                    // invalidregisternumber.push(student.register)
                    continue
                }
                if(enrollmentdata.approval <-1 && enrollmentdata.approval>-11){
                    success = false
                   
                    obj.register= student.register
                    obj.courseCode= course.courseCode
                    obj.status="rejected"
                    
                    invalid.push(obj)
                    // invalidCourseCode.push(course.courseCode)
                    // invalidregisternumber.push(student.register)
                    continue
                }
                enrollmentdata.approval = student.approval
                
                const result = await enrollmentdata.save()
                
                if(!result){
                    message = "Unable to save the changes to database"
                    success = false
                    // invalidCourseCode.push(course.courseCode)
                    // invalidregisternumber.push(student.register)
                    continue
                }
            }
        }
       
        
        res.status(200).json({success:success,message:message,invalid,invalidCourseCode,invalidregisternumber,unenrolled})
        
  
        
    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////

export const CR_FA_getRegisteredstudentslist = async(req, res) => {
    try{
        const { batch, sem, branch } = req.body
        
        const data = await EnrollmentModel.find({batch:batch, branch:{$in:branch},semester:{$in:sem},enrolled:true,approval:{$in:[-11,-12,-13,-14,10,11,12,13,14]}}, {courseCode:1,studentId:1,branch:1,enrolled:1,approval:1,_id:0}).populate("courseCode", {courseCode:1,title:1}).populate("studentId",{firstName:1,register:1,branch:1,batch:1})     
             

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

export const CR_FA_approvestudents = async(req, res) => {
    try{
        const {courses} = req.body
        let success = true
        let message = "All the changes have been modified"
        let invalidCourseCode = ["message : Following Course Codes was not found in curriculum"]
        let invalidregisternumber = ["message : Following Student register numbers were not found in students collection"]
        let invalid = [
            "message : Following students were approved/rejected by higher staffs. (You will not be able to perform any changes)"
        ]
        let unenrolled = [
            "message : Following Students have not enrolled for given courses"]


        for(let course of courses){          
            const courseinfo = await CurriculumModel.findOne({courseCode:course.courseCode})
           
            if(!courseinfo){
                success = false
                const objc = {
                    courseCode:course.courseCode
                }
                invalidCourseCode.push(objc)
                continue
            }
            for(let student of course.students){
               
                const studentinfo = await StudentsModel.findOne({register:student.register})
                const obj = {}
                if(!studentinfo){
                    success = false
                    const objs = {
                        register: student.register
                    }
                    invalidregisternumber.push(objs)
                    continue
                }
               
                const enrollmentdata = await EnrollmentModel.findOne({courseCode:courseinfo._id,studentId:studentinfo._id})
               
                if(!enrollmentdata){
                    const objs = {
                        register: student.register,
                        courseCode:course.courseCode
                    }
                    unenrolled.push(objs)
                    success = false
                    continue
                }
                if(enrollmentdata.approval>11){
                    success = false
                    
                    obj.register= student.register
                    obj.courseCode= course.courseCode
                    obj.status="approved"
                    
                    invalid.push(obj)
                    continue
                }
                if(enrollmentdata.approval <-11 && enrollmentdata.approval >-15){
                    success = false
                   
                    obj.register= student.register
                    obj.courseCode= course.courseCode
                    obj.status="rejected"
                    
                    invalid.push(obj)
                    continue
                }
                enrollmentdata.approval = student.approval
                
                const result = await enrollmentdata.save()
                
                if(!result){
                    message = "Unable to save the changes"
                    success = false
                    // invalidCourseCode.push(course.courseCode)
                    // invalidregisternumber.push(student.register)
                    continue
                }
            }
        }
       
        res.status(200).json({success:success,message:message,invalid,invalidCourseCode,invalidregisternumber,unenrolled})
        
  
        
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