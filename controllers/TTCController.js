///////////////////////  ADMIN MODULE ///////////////////////

import { SemesterMetadataModel } from "../models/SemesterMetadataModel.js"
import { FacultyModel } from "../models/FacultyModel.js"
import { CourseDetailsModel } from "../models/CourseDetailsModel.js"
import { MasterTimetableModel } from "../models/MasterTimetableModel.js"
import { BranchModel } from "../models/BranchModel.js"
import { CurriculumModel } from "../models/CurriculumModel.js"
import { EnrollmentModel } from "../models/EnrollmentModel.js"
import { StudentsModel } from "../models/StudentsModel.js"
import mongoose from "mongoose"
import { CalendarModel } from "../models/CalendarModel.js"
///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////

export const getStaff = async (req,res) => {
    try {

        let result = {}
        let { branch } = req.query
        let sems = await SemesterMetadataModel.find({},{ _id:0, sem:1, batch:1 }).sort({date:-1}).limit(3)
        result.sems = sems
        result.courses = []
        for(let sem of sems) {
            let courses = await CourseDetailsModel.find({branch:branch, semester:sem.sem,batch:sem.batch, type:"theory"}, {courseId:1, courseCode:1, semester:1, batch:1, }).populate("courseId",{_id:1, title:1, category:1}).populate("facultyId", {_id:1, title:1, firstName:1, lastName:1})
            courses = courses.map(course => ( course.toObject() ))
            if(courses.length==0){
                let data =  {
                    "_id": "",
                    "semester": sem.sem,
                    "courseCode": "",
                    "batch": sem.batch,
                    "facultyId": "",
                    "courseName": "",
                    "courseCategory": "",
                    "facultyName": ""
                    }
                let data1 = await EnrollmentModel.aggregate(
                    [
                        {
                            "$match": {semester:sem.sem, batch:sem.batch}
                        }, 
                        {
                            $group:{_id:"$courseCode"}
                        } 
                    ])
                //data1 = data1.map(data => ({ ...data._doc }))
                await CurriculumModel.populate(data1, {path:"_id", select: {courseCode:1, title:1, category:1}})
                for(let course of data1){
                    data.courseCode = course._id.courseCode
                    data.courseName = course._id.title
                    data.courseCategory = course._id.category
                    data.courseId = course._id._id
                    result.courses.push({ ...data })
                }
            }else{ 
                for (let course of courses){
                    course.courseName = course.courseId.title
                    course.courseCategory = course.courseId.category
                    course.courseId = course.courseId._id
                    if(course.hasOwnProperty('facultyId')){
                        course.facultyName = course.facultyId.title + ""+ course.facultyId.firstName + "" + course.facultyId.lastName
                        course.facultyId = course.facultyId._id
                    } else {
                        course.facultyName = ""
                        course.facultyId = ""
                    }
                    result.courses.push({ ...course})
                }
            }
            
        }
        result.faculty = await FacultyModel.find({},{title:1, firstName:1, lastName:1})
        result.faculty = result.faculty.map(staff => ({ ...staff._doc }))
        for(let faculty of result.faculty){
            faculty.Name = faculty.title + "" + faculty.firstName + "" + faculty.lastName
            delete faculty.title
            delete faculty.firstName
            delete faculty.lastName
        }
        
        res.status(200).json(result);

    } catch(err) { res.status(200).send("Request Failed: "+ err.message ) }
}

//pending
export const postStaff = async (req,res) => {
    try{
        await CourseDetailsModel.deleteMany({type:"zetgvedtzve"})
        let { courses } = req.body
        let data1 = {
            semType: "",
            semester: 0,
            courseId: "",
            courseCode: "",
            type: "",
            branch: "",
            batch: "",
            groupNo: 1,
            schedule: [],
            unitSchedule:[
                {
                    number:1,
                    session:"",
                    type:"",
                },
                {
                    number:2,
                    session:"",
                    type:"",
                },
                {
                    number:3,
                    session:"",
                    type:"",
                }
            ]
        }
        for(let course of courses){
            if (course._id != ""){
                await CourseDetailsModel.updateOne({_id:course._id},{$set: {facultyId:course.facultyId}})
            } else {
                data1._id = mongoose.Types.ObjectId()
                data1.semType = course.semester%2==0 ? "even" : "odd"
                data1.semester = course.semester
                data1.courseId = course.courseId
                data1.courseCode = course.courseCode
                data1.type = "theory"
                data1.branch = course.branch
                data1.batch = course.batch
                if(course.hasOwnProperty('facultyId')){
                    data1.facultyId = course.facultyId
                }
                await CourseDetailsModel.insert(data1)
                console.log("updated")
                await EnrollmentModel.updateMany({branch:course.branch,batch:course.batch,semester:course.semester,courseCode:course.courseId}, {courseId:data1._id})
            }
        }
        res.status(200).send("Updated successfully")
    } catch(err) { res.status(400).send("Request Failed: "+err.message)}
}

// Doubt iruku
export const getTimetable = async (req,res) => {
    try{
        let { branch } = req.query
        let sems = await SemesterMetadataModel.find({},{ _id:0, sem:1, batch:1 }).sort({date:-1}).limit(3)
        let result = {}
        result.courses = await CourseDetailsModel.find({branch:branch, $or:[{semester:sems[0].sem,batch:sems[0].batch},{semester:sems[1].sem,batch:sems[1].batch},{semester:sems[2].sem,batch:sems[2].batch}]}, {facultyId:1, batch:1, newSchedule:1, semester:1, schedule:1, courseCode:1}).populate("courseId", {_id:0,title:1}).populate("facultyId",{title:1, firstName:1, lastName:1})
        result.sems = sems
        result.courses = result.courses.map(course => ( course.toObject() ))
        console.log(result.courses)
        for(let course of result.courses){
            course.courseName = course.courseId.title
            delete course.courseId
            if(course.newSchedule.hasOwnProperty("effectiveDate")){
                course.effectiveDate = course.newSchedule.effectiveDate
                course.schedule = course.newSchedule.schedule
            }
            delete course.newSchedule
            if(course.hasOwnProperty("facultyId")){
                course.facultyName = course.facultyId.title + "" +course.facultyId.firstName + "" + course.facultyId.lastName;
                course.facultyId = course.facultyId._id
            }
        }
        res.status(200).send(result)
    } catch(err) { res.status(400).send("Request Failed: " + err.message) }
}

//cron job pending
export const postTimetable = async (req,res) => {
    try{
        
        let { data, ed, branch, batch } = req.body
        ed = new Date(ed)
        for(let course of data){
            let temp = {
                effectiveDate: ed,
                schedule: course.schedule
            }
            await CourseDetailsModel.updateOne({_id:course.courseId}, {$set: {newSchedule: temp}})
        }
        res.status(200).send("Updated Successfully")
    } catch(err) { res.status(400).send("Request Failed: " + err.message) }
}

export const getUt = async (req, res) => {
    try{
        let { branch, batch, semester } = req.query
        let sems = await SemesterMetadataModel.find({},{ _id:0, sem:1, batch:1 }).sort({date:-1}).limit(3)
        let result = await CourseDetailsModel.find({branch:branch,$or:[{semester:sems[0].sem,batch:sems[0].batch},{semester:sems[1].sem,batch:sems[1].batch},{semester:sems[2].sem,batch:sems[2].batch}]}, {_id:1, courseCode:1, unitSchedule:1 }).populate("courseId", {title:1})
        result = result.map(ut => ({ ...ut._doc }))
        let course_list = []
        for(let course of result){
            course.courseName = course.courseId.title
            delete course.courseId
            for(let ut of course.unitSchedule){
                let temp = {}
                temp.coursId = course._id
                temp.courseName = course.courseName
                temp.courseCode = course.courseCode
                temp.date = ut.date
                temp.number = ut.number
                temp.session = ut.session
                course_list.push(temp)
            }
        }
        let data = {
            sems: sems,
            courses: course_list
        }
        res.status(200).json(data)
    } catch (err) { res.status(400).send("Request Failed: " + err.message) }
}

export const getGroups = async (req,res) => {
    try{
        // await CourseDetailsModel.deleteMany({type:"practical"})
        let { branch } = req.query
        let sems = await SemesterMetadataModel.find({},{ _id:0, sem:1, batch:1 }).sort({date:-1}).limit(3)
        let result = {}
        result.courses = []
        for(let sem of sems){
            let data1 = await EnrollmentModel.aggregate(
                [
                    {
                        "$match": {semester:sem.sem, batch:sem.batch,branch:branch, type:"practical"}
                    }, 
                    {
                        $group:{
                            _id:{"courseCode":"$courseCode","groupNo":"$groupNo", "courseId":"$courseId"}, 
                            students:{ $push: "$studentId"}
                        }
                    }  
                ])
            console.log(data1)
            await CurriculumModel.populate(data1, {path:"_id.courseCode", select: {courseCode:1, title:1, category:1}})
            await StudentsModel.populate(data1, {path: "students", select: {register:1}});
            for(let course of data1){
                let data =  {
                    "semester": sem.sem,
                    "batch": sem.batch,
                    "courseId":"", 
                    "courseCode": "",
                    "courseName": "",
                    "groupNo":0,
                    "studentId":[],
                    "student":[]
                    }
                if(course._id.hasOwnProperty("courseId")){
                    await CourseDetailsModel.populate(course, {path: "_id.courseId", select:{facultyId:1}})
                    data._id = course._id.courseId._id
                    let temp = {...course._id.courseId}
                    temp = temp._doc
                    if(temp.hasOwnProperty("facultyId")){
                        console.log("faculty = ")
                        await FacultyModel.populate(temp, {path: "facultyId", select:{title:1, firstName:1, lastName:1}})
                        data.facultyId = temp.facultyId._id
                        data.facultyName = temp.facultyId.title+temp.facultyId.firstName+temp.facultyId.lastName
                    }
                }
                data.courseId = course._id.courseCode._id
                data.courseCode = course._id.courseCode.courseCode
                data.courseName = course._id.courseCode.title
                data.groupNo = course._id.groupNo
                for(let student of course.students){
                    data.student.push(student.register)
                    data.studentId.push(student._id)
                }
                console.log({...data})
                result.courses.push({...data})
            }
        }
        result.faculty = await FacultyModel.find({},{title:1, firstName:1, lastName:1})
        result.faculty = result.faculty.map(staff => ({ ...staff._doc }))
        for(let faculty of result.faculty){
            faculty.Name = faculty.title + "" + faculty.firstName + "" + faculty.lastName
            delete faculty.title
            delete faculty.firstName
            delete faculty.lastName
        }
        res.status(200).send(result);
    } catch (err) { res.status(400).send("Request Failed: "+err.message) }
}


export const postGroups = async (req,res) => {
    try{

        let { courses, branch } = req.body
        let data = []
        for (let course of courses){
            console.log("entry=",course)
            if (course.hasOwnProperty("_id")){
                if(course.hasOwnProperty("facultyId")){
                    await CourseDetailsModel.updateOne({_id:course._id},{$set:{facultyId:course.facultyId}})
                }
            }else{
                let data1 = {
                    _id: mongoose.Types.ObjectId(),
                    semType: course.semester%2==0?"even":"odd",
                    semester: course.semester,
                    courseId: course.courseId,
                    courseCode: course.courseCode,
                    type: "practical",
                    branch: branch,
                    batch: course.batch,
                    groupNo: course.groupNo,
                    schedule: [],
                    unitSchedule:[
                        {
                            number:1,
                            session:"",
                            type:"",
                        },
                        {
                            number:2,
                            session:"",
                            type:"",
                        },
                        {
                            number:3,
                            session:"",
                            type:"",
                        }
                    ]
                }
                for(let student of course.studentId){
                    await EnrollmentModel.updateOne({studentId:student,courseCode:course.courseId,type:"practical"},{$set:{courseId:data1._id}} )
                }
                data.push({...data1})
                // for(let student of course.studentId){
                //     await EnrollmentModel.updateOne({studentId:student,courseCode:course.courseId,type:"practical"},{$unset:{courseId:""}} )
                // }
            }
        }
        if(data.length!=0)
            await CourseDetailsModel.insertMany(data)
        res.status(200).json(await EnrollmentModel.find({type:"practical"}))

    } catch (err) { res.status(400).send("Request Failed: " + err.message) }
}

export const getdailyjob = async (req,res) => {
    try{
        let date = new Date(new Date().toJSON().slice(0, 10))
        console.log(date)
        let cal = await CalendarModel.find({date:date})
        let periods = []
        let fn = false
        let an = false
        if (cal[0].isWorkingDay==true){
            for(let batch of cal[0].batches){
                if(batch!=2019)
                    continue
                console.log("batch = ", batch)
                let branches = await BranchModel.find({})
                let sem = await SemesterMetadataModel.find({batch:batch},{ _id:0, sem:1, freeze:1}).sort({date:-1}).limit(1) 
                console.log(sem[0].sem)
                console.log(branches)
                for(let branch of branches){
                    console.log("branch = ",branch.branch)
                    let courses = await CourseDetailsModel.find({branch:branch.branch, semester:sem[0].sem, batch:batch},{schedule:1,unitSchedule:1,facultyId:1, newSchedule:1})
                    courses = courses.map(course => ({ ...course._doc }))
                    for(let course of courses){
                        if (course.newSchedule.hasOwnProperty("effectiveDate")){

                            if(course.newSchedule.effectiveDate.toString()==date.toString()){
                                course.schedule = course.newSchedule.schedule
                                await CourseDetailsModel.updateOne({_id:course._id}, {schedule:course.schedule,newSchedule:null})
                            }
                        }
                        let period = {
                            date: date,
                            branch: branch.branch,
                            batch: batch,
                            dayOrder: cal[0].order,
                            workingDay: true,
                            courseId:course._id,
                            facultyId:course.facultyId,
                            period:0,
                            type:"regular",
                            freeze: new Date(new Date(new Date().setDate(date.getDate()+sem[0].freeze.attendance)).toJSON().slice(0, 10))
                        }
                        for(let schedule of course.schedule){
                            if(Math.floor(schedule/10)==cal[0].order){
                                if((schedule%10)<=4&&fn==false){
                                    period.period = schedule%10
                                    periods.push({...period})
                                }
                                if((schedule%10)>4&&an==false){
                                    period.period = schedule%10
                                    periods.push({...period})
                                }
                            }
                        }
                        for(let ut of course.unitSchedule){
                            console.log("date = ",ut.date, " ", typeof ut.date)
                            console.log("cal date = ", cal[0].date, " ", typeof cal[0].date)
                            if(ut.date.toString()==cal[0].date.toString()){
                                console.log("Date Matched")
                                if(ut.session=="FN"){
                                    fn=true
                                    periods = periods.filter(period => ![1,2,3,4].some(each => period.period == each))
                                    period.period = 2
                                    periods.push({...period})
                                    period.period = 3
                                    periods.push({...period})
                                }
                                if(ut.session=="AN"){
                                    an=true
                                    periods = periods.filter(period => ![5,6,7,8].some(each => period.period == each))
                                    period.period = 6
                                    periods.push({...period})
                                    period.period = 7
                                    periods.push({...period})
                                }
                                
                            }
                        }
                        //console.log("1 completed")
                    }
                }
                console.log(periods)
            }
        }
        res.status(200).json(periods)
    } catch (err) { res.status(400).send("Request Failed: " + err.message) }
}


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


