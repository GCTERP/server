<<<<<<< HEAD
import { SemesterMetadataModel } from '../models/SemesterMetadataModel.js'
import { ElectiveMetadataModel } from '../models/ElectiveMetadataModel.js'
import { EnrollmentModel } from '../models/EnrollmentModel.js'
import { CurriculumModel } from '../models/CurriculumModel.js'
import { StudentsModel } from '../models/StudentsModel.js'
import { ValueAddedCourseModel } from '../models/ValueAddedCourseModel.js'
import { ExternalsModel } from '../models/ExternalsModel.js'
=======
import { AttendanceModel } from "../models/AttendanceModel.js";
import { CourseDetailsModel } from "../models/CourseDetailsModel.js";
import { CurriculumModel } from "../models/CurriculumModel.js";
import { EnrollmentModel } from "../models/EnrollmentModel.js";
import { FacultyModel } from "../models/FacultyModel.js";
import { MasterTimetableModel } from "../models/MasterTimetableModel.js";
import { RequestsModel } from "../models/RequestsModel.js";
import { StudentDetailsModel } from "../models/StudentDetailsModel.js";

>>>>>>> 3c3de1a70bc670858a07338b00b0efd21a5a323d

///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////

export const demo = async (req, res) => {

    try {
        await AttendanceModel.deleteMany({ masterTimetableId: "63faea970fbbb6e187cba951" })
        res.status(200).send("Success")
    } catch (err) { res.status(400).send("Failed: " + err.message); }
}

//Completed
export const getTimetable = async (req, res) => {

    try {

        let { studentId, semester } = req.query

        //Fetch all enrolled course of this semester
        
        let data = await EnrollmentModel.find({studentId:studentId, semester:semester, branch:"Information Technology"}, {courseId:1}).populate("courseId", {schedule:1, newSchedule:1, courseCode:1, courseId:1, facultyId:1})
        await CurriculumModel.populate(data, {path:"courseId.courseId", select:{title:1}})
        await FacultyModel.populate(data, {path:"courseId.facultyId", select:{title:1, firstName:1, lastName:1}})

        data = data.map(course => course.toObject())
        console.log("data loaded =", data)
        //Iterate over each Course
        for(let course of data){

            //Send newSchedule if any...
            if (course.courseId.newSchedule != null) {

                course.effectiveDate = course.courseId.newSchedule.effectiveDate
                course.schedule = course.courseId.newSchedule.schedule

            } else {
                course.schedule = course.courseId.schedule
            }

            delete course.courseId.newSchedule

            //Regularize data for front-end
            course.facultyName = course.courseId.facultyId.title + " " + course.courseId.facultyId.firstName + " " + course.courseId.facultyId.lastName
            delete course.courseId.facultyId
            course.courseCode = course.courseId.courseCode
            course.courseName = course.courseId.courseId.title

            delete course.courseId
            console.log("course = ", course)
        }

        res.status(200).json(data)

    } catch (err) { res.status(400).send("Failed: " + err.message); }

}


//Completed
export const getMasterTimetable = async (req, res) => {

    try {

        let { studentId, semester } = req.query

        //Fetch all courses of this semester
        let data = await EnrollmentModel.find({ studentId: studentId, semester: semester }, { courseId: 1 }).populate("courseCode", { title: 1, courseCode: 1 })
        data = data.map(course => course.toObject())
        let result = []

        //Iterate over each course
        for (let course of data) {

            //Get All Periods of the course from mastertimetable
            let periods = await MasterTimetableModel.find({ courseId: course.courseId }, { _id: 1, date: 1, period: 1, marked: 1 })
            periods = periods.map(period => period.toObject())

            //Iterate over each period
            for (let period of periods) {

                //Check if attendance marked
                if (period.marked == true) {

                    let attendance = await AttendanceModel.find({ studentId: studentId, masterTimetableId: period._id }, { present: 1, onduty: 1 })
                    period.present = attendance[0].present
                    period.onduty = attendance[0].onduty

                }

                //Regularize data for front-end
                period.courseName = course.courseCode.title
                period.courseCode = course.courseCode.courseCode

                result.push({ ...period })
            }

        }

        res.status(200).json(result)

    } catch (err) { res.status(400).send("Failed: " + err.message); }

}


/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////


// check for enrolment status
export const CE_Student_checkforenrolment = async(req, res) => {
    try{
        // const studentmail = "abir.1918101@gct.ac.in"
        const studentmail = "abiramee1128@gmail.com"
        const studentinfo = await StudentsModel.findOne({email:studentmail})
       if(!studentinfo){
        console.log("The student" + studentmail + " is not available in students collection")
       }
        const enrollmentstatus = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester, batch:studentinfo.batch}})
        if(enrollmentstatus){
            if(enrollmentstatus.enrollment.status == 'Active'){
                res.status(200).json({success:true, msg:"Enrollment is enabled"})
            }else{
                res.status(200).json({success:false, msg:"Enrollment is not enabled"})
            }
        }
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


// fetch data to feed the enrollment page 
export const CE_Student_getenrolmentdata = async(req, res) => {
    try{
        let allowedpeelectives=[], allowedoeelectives=[], addonallowed=false, addontype=[], oecourses=[], pecourses=[],electivesallowed=false,mandatorycourses = [],previouslyenrolledelectives=[],previouslyenrolledeladdon=[], ispreviouslyenrolledelectives=false, ispreviouslyenrolledforaddon=false
        // const studentmail = "abir.1918101@gct.ac.in"
        const studentmail = "abiramee1128@gmail.com"
        const studentinfo = await StudentsModel.findOne({email:studentmail})
        
        // Check for the existance of student details
        if(!studentinfo){
            console.log("The student" + studentmail + " is not available in students collection")
        }

        // check whether the semester is created in semester metadata model
        const enrollmentstatus = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester,batch:studentinfo.batch}})
    
        // if not create do nothing
        if(enrollmentstatus){

            // check whether the enrollment is enabled
            if(enrollmentstatus.enrollment.status == 'Active'){
                
            // fetch all the mandatory courses from the curriculum model
            const mandatorycoursesindb = await CurriculumModel.find({semester:studentinfo.currentSemester,branch:studentinfo.branch})
            
            // 
            for(let each of mandatorycoursesindb){
                const foundinenrollment = await EnrollmentModel.findOne({studentId:studentinfo._id, courseCode:each._id})
                
                const obj = {
                    courseCode:each.courseCode,
                    title:each.title
                }

                if(foundinenrollment && !foundinenrollment.enrolled && foundinenrollment.semester == studentinfo.currentSemester){
                    obj.previouslyenrolled = true
                }
                mandatorycourses.push(obj)
            }
            
            // check whether electives are allowed for the student's current semester
            const allowedelectivecourses = await ElectiveMetadataModel.findOne({regulation:studentinfo.regulation,branch:studentinfo.branch,semester:studentinfo.currentSemester})

            // if allowed what are those
            if(allowedelectivecourses){
                electivesallowed = true 
                for(let each of allowedelectivecourses.oe){
                    const foundinenrollment = await EnrollmentModel.findOne({studentId:studentinfo._id, courseCategory:each}).populate("courseCode")
                    
                    // if not found in enrollment means - The students was never enrolled for this course
                    if(!foundinenrollment){
                        allowedoeelectives.push(each)
                    }

                    // means - The student enrolled to this course in this semester only
                    // so allow him to update
                    if(foundinenrollment && !foundinenrollment.enrolled && foundinenrollment.semester == studentinfo.currentSemester){
                        allowedoeelectives.push(each)
                        const obj = {
                            courseType:each,
                            courseCode:foundinenrollment.courseCode.courseCode,
                            title:foundinenrollment.courseCode.title,
                            previouslyenrolledforthiselective:true
                        }
                        ispreviouslyenrolledelectives = true
                        previouslyenrolledelectives.push(obj)
                    }
                }

                for(let each of allowedelectivecourses.pe){
                    const foundinenrollment = await EnrollmentModel.findOne({studentId:studentinfo._id, courseCategory:each}).populate("courseCode")
                    if(!foundinenrollment){
                        allowedpeelectives.push(each)
                    }
                    if(foundinenrollment && foundinenrollment.semester == studentinfo.currentSemester && !foundinenrollment.enrolled){
                        
                        allowedpeelectives.push(each)
                        const obj = {
                            courseType:each,
                            courseCode:foundinenrollment.courseCode.courseCode,
                            title:foundinenrollment.courseCode.title,
                            previouslyenrolledforthiselective:true
                        }
                        ispreviouslyenrolledelectives = true
                        previouslyenrolledelectives.push(obj)
                    }
                }

                const getpecourses = await CurriculumModel.find({branch:studentinfo.branch,category:"PE"})
                for(let each of getpecourses){
                    const foundinenrollment = await EnrollmentModel.findOne({studentId:studentinfo._id, courseCode:each._id}).populate("courseCode")
                    if(foundinenrollment && foundinenrollment.semester!=studentinfo.currentSemester){
                        // console.log(foundinenrollment.courseCode.courseCode)
                        // this elective is already enrolled by the student
                        continue
                    }
                    pecourses.push(each)
                    
                }

                const getoecourses = await CurriculumModel.find({category:"OE"})
                for(let each of getoecourses){
                    const foundinenrollment = await EnrollmentModel.findOne({studentId:studentinfo._id, courseCode:each._id}).populate("courseCode")
                    if(foundinenrollment && foundinenrollment.semester!=studentinfo.currentSemester){
                        // console.log(foundinenrollment.courseCode.courseCode)
                        // this elective is already enrolled by the student
                        continue
                    }
                    oecourses.push(each)
                    
                }
            }
                
            // check whether addon is enavbled while creating a semester
            const semesterdataforaddon = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester,batch:studentinfo.batch}})
            if(semesterdataforaddon){

                addonallowed = semesterdataforaddon.addOnEligible
                
                // if addon is enabled
                if(addonallowed){

                    // ELECTIVE TYPES - (Those can only be choosen as Addon's)
                    //  check other semester elective types
                    // because current semester electives can't be choosen as addon
                    // because the student must be choosen addon as any one of these types
                    const electivedata = await ElectiveMetadataModel.find({regulation:studentinfo.regulation,semester:{$nin:[studentinfo.currentSemester]}})
                    
                    // So traverse through for each object(i.e each semester data)
                    for(let each of electivedata){

                        // check OPEN elective type
                        for(let eachoe of each.oe){
                            // because in some semester there will be no field created
                            if(eachoe==undefined){
                                continue
                            }
                            const isfoundinEnrollment = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCategory:eachoe,semester:{$nin:[studentinfo.currentSemester]}})
                            if(isfoundinEnrollment){
                                // This course Category was already studied by student may be as addon
                                // does not allow in add on type
                                continue
                            }

                            addontype.push(eachoe)
                        }

                        for(let eachpe of each.pe){
                            if(eachpe==undefined){
                                continue
                            }
                            const isfoundinEnrollment = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCategory:eachpe,semester:{$nin:[studentinfo.currentSemester]}})
                            if(isfoundinEnrollment){
                                // This course Category was already studied by student
                                // does not allow in add on type
                                continue
                            }
                            addontype.push(eachpe)
                        }
                    }

                    // ADDON saved in this current semester enrollment
                    for(let each of electivedata){
                        // Addon as OPEN Elective
                        for(let eachoe of each.oe){
                            const foundinEnrollment = await EnrollmentModel.find({studentId:studentinfo._id,courseCategory:eachoe,semester:studentinfo.currentSemester}).populate("courseCode")
                            for(let isfoundinEnrollment of  foundinEnrollment){
                                const obj = {
                                    courseType:isfoundinEnrollment.courseCategory,
                                    courseCode:isfoundinEnrollment.courseCode.courseCode,
                                    title:isfoundinEnrollment.courseCode.title,
                                    previouslyenrolledforthisaddon:true
                                }
                                ispreviouslyenrolledforaddon = true
                                previouslyenrolledeladdon.push(obj)
                            }
                        }  

                        // Addon as PROFESSIONAL Elective
                        for(let eachpe of each.pe){
                            const foundinEnrollment = await EnrollmentModel.find({studentId:studentinfo._id,courseCategory:eachpe,semester:studentinfo.currentSemester}).populate("courseCode")
                            for(let isfoundinEnrollment of  foundinEnrollment){
                                const obj = {
                                    courseType:isfoundinEnrollment.courseCategory,
                                    courseCode:isfoundinEnrollment.courseCode.courseCode,
                                    title:isfoundinEnrollment.courseCode.title,
                                    previouslyenrolledforthisaddon:true
                                }
                                ispreviouslyenrolledforaddon = true
                                previouslyenrolledeladdon.push(obj)
                                
                            }
                        }  
                    }   
                }        
            }
            
            res.status(200).json({success:true, msg:"Enrollment details are fetched",Semester:studentinfo.currentSemester, ispreviouslyenrolledelectives, previouslyenrolledelectives,electivesallowed:electivesallowed,oeallowed:allowedoeelectives,peallowed:allowedpeelectives,addonallowed,ispreviouslyenrolledforaddon, previouslyenrolledeladdon, addontype:addontype,courses:{mandatorycourses,pecourses,oecourses}})
            
        }
        }else{
            res.status(200).json({success:false, msg:"Enrollment is not enabled, Can't send courses"})
        }

    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error})
    }
}


// save the user enrolled course to the database
export const CE_Student_saveenrolmentdata = async(req, res) => {
    try{
   
        const coursesenrolled = {
            courseCode : req.body.courses
        }
        const electives = req.body.electives
        
        // console.log(electives)
        
        const enrollmentdata = {
            enrolled : false,
            approval : 0
        }
        
        // Fetch User details
        // const usermail = "abir.1918101@gct.ac.in"
        const usermail = "abiramee1128@gmail.com"
        const studentinfo = await StudentsModel.findOne({email:usermail})
       
        enrollmentdata.studentId = studentinfo._id
        enrollmentdata.batch = studentinfo.batch
        enrollmentdata.regulation = studentinfo.regulation
        if(studentinfo.currentSemester%2==0){
            enrollmentdata.semType="even"
        }else{
            enrollmentdata.semType="odd"
        }
        enrollmentdata.semester = studentinfo.currentSemester
        enrollmentdata.branch = studentinfo.branch
        enrollmentdata.type = "normal"
        
        EnrollmentModel.deleteMany({studentId:studentinfo._id,approval:0,enrolled:false}).then(p=>console.log(p))
          
        if(electives!=null){
            for(let eachcourse of electives){
                const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachcourse.courseCode})
            enrollmentdata.courseCode = courseincurriculummodel._id
            
            if(courseincurriculummodel.category=="PE" || courseincurriculummodel.category=="OE"){
                enrollmentdata.courseCategory = eachcourse.courseType
            }else{
                enrollmentdata.courseCategory = courseincurriculummodel.category
            }
           
            if(courseincurriculummodel){
                const newenrollmentdata = new EnrollmentModel(enrollmentdata)
                await newenrollmentdata.save()   
            }
            else{
                console.log("No such Course Code is found in the database")
            }
        }

        }
        coursesenrolled.courseCode.forEach(savetodb);
        async function savetodb(eachcourse) {
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachcourse})
            enrollmentdata.courseCode = courseincurriculummodel._id
            
            enrollmentdata.courseCategory = courseincurriculummodel.category
    
            if(courseincurriculummodel){
                const newenrollmentdata = new EnrollmentModel(enrollmentdata)
                await newenrollmentdata.save()   
            }
            else{
                res.status(200).json({success:false, message:"No such Course Code is found in the database"})
            }
        }
        res.status(200).json({success:true, message:"Enrollment details were saved to database"})
     
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}



/////////////////////// RESULT MODULE ///////////////////////
export const Result_Student_Result =async(req, res) =>{
    try{
        //const {reg} = req.body
        // const data = await SemesterMetadataModel.findOne({semester})
        //const studentinfo = await StudentsModel.find({})
        //console.log(studentinfo)
        const register = "1918101"
        const studentinfo = await StudentsModel.findOne({register:register})
        // console.log(studentinfo)
        const studentResults = await ExternalsModel.find({studentId:studentinfo._id}).populate("studentId courseId")
        console.log(studentResults)
    res.status(200).json({success:true, message:"Result is fetched successfully", studentResults})    
    }
    catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}


/////////////////////// REGISTRATION MODULE ///////////////////////

// check for Registration status
export const CR_Student_checkforregistration = async(req, res) => {
    try{
        // const studentmail = "abir.1918101@gct.ac.in"
        const studentmail = "abiramee1128@gmail.com"
        const studentinfo = await StudentsModel.findOne({email:studentmail})
       
        const registrationstatus = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester, batch:studentinfo.batch}})
        if(registrationstatus){
            if(registrationstatus.courseRegistration.status == 'Active'){
                res.status(200).json({success:true, msg:"Registration is enabled"})
            }else{
                res.status(200).json({success:false, msg:"Registration is not enabled"})
            }
        }else{
            res.status(200).json({success:false, message:"Unable to find the status in semester metadata collection"})
            
        }
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

//fetch data and feed to registartion
export const CR_Student_getregisterdata = async(req, res) => {

try{
    // fetch the data from user login
    // const studentmail = "abir.1918101@gct.ac.in"
    const studentmail = "abiramee1128@gmail.com"
    const studentinfo = await StudentsModel.findOne({email:studentmail})

    // console.log(studentinfo)
    const registerstatus = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester,batch:studentinfo.batch}})
    let enrolledCourses = [], RACourses =[], SACourses = [], internship = [], activityPoints =[], DroppedCourses = [] , allowApplyForIntern = false, allowApplyForActPoints = false, registeredforinternship=false, registeredforactivitypoints=false
    
    if(registerstatus.courseRegistration.status == 'Active'){
        
        const db_enrolledCourses = await EnrollmentModel.find({studentId:studentinfo._id, type:"normal", enrolled:true, approval:{ $in: [3,4,10] } }).populate("courseCode", {courseCode:1,title:1,_id:0})
       
        for(let eachdoc of db_enrolledCourses){
            let obj  = {
                courseCategory:eachdoc.category,
                courseCode:eachdoc.courseCode.courseCode,
                courseTitle:eachdoc.courseCode.title,
                approval:eachdoc.approval
            }
            enrolledCourses.push(obj)
        }

        // Re - Appear Courses
        const db_RACourses = await ExternalsModel.find({studentId:studentinfo._id,result:"RA"}).populate("courseId", {courseCode:1,title:1,_id:1})
        for(let eachdoc of db_RACourses){
            console.log(eachdoc)
            const enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:eachdoc.courseId._id,type:"RA"})
            console.log(enrollmentdata)
            if(enrollmentdata){
                
                if(enrollmentdata.approval==13 || enrollmentdata.approval==14){
                    enrollmentdata.approval=4
                    // await enrollmentdata.save()
                }
                const obj = {
                    courseCategory:eachdoc.category,
                    courseCode:eachdoc.courseId.courseCode,
                    title:eachdoc.courseId.title,
                    approval:enrollmentdata.approval
                }
                RACourses.push(obj)
            }
        }

        // Re - Registration courses
        const db_SACourses = await ExternalsModel.find({studentId:studentinfo._id,result:"SA"}).populate("courseId", {courseCode:1,title:1,_id:1})
        for(let eachdoc of db_SACourses){
            const enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:eachdoc.courseId._id,type:"SA"})
            // console.log(enrollmentdata.approval)
            if(enrollmentdata){
                if(enrollmentdata.approval==13 || enrollmentdata.approval==14){
                    enrollmentdata.approval=4
                    // await enrollmentdata.save()
                }
                const obj = {
                    courseCategory:eachdoc.category,
                    courseCode:eachdoc.courseId.courseCode,
                    title:eachdoc.courseId.title,
                    approval:enrollmentdata.approval
                }
                SACourses.push(obj)
            }else{
                console.log("The SA Course " + eachdoc + " was not marked as SA in enrollment collection")
            }
        }

        // Dropped Courses courses
        const db_DroppedCourses = await EnrollmentModel.find({studentId:studentinfo._id,type:"dropped"}).populate("courseCode", {courseCode:1,title:1,_id:1})
        for(let eachdoc of db_DroppedCourses){
            // const enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:eachdoc.cours._id,type:"dropped"})
            // console.log(eachdoc.approval)
            if(eachdoc.approval==13 || eachdoc.approval==14){
                eachdoc.approval=4
                // await db_DroppedCourses.save()
            }
            const obj = {
                courseCategory:eachdoc.category,
                courseCode:eachdoc.courseCode.courseCode,
                title:eachdoc.courseCode.title,
                approval:eachdoc.approval
            }
            DroppedCourses.push(obj)
        }
        
        
        
        // fetch internship details
        // check whether the coursecode for internship is available in curriculum
        const courseDataforInternship = await CurriculumModel.findOne({category:"internship",regulation:studentinfo.regulation})
        
        if(courseDataforInternship){
            const createEnrollmentModel = {
                type:"internship",
                studentId:studentinfo._id,
                regulation:studentinfo.regulation,
                batch:studentinfo.batch,
                courseCode:courseDataforInternship._id,
                courseCategory:courseDataforInternship.category,
                branch:studentinfo.branch,
                semester:studentinfo.currentSemester,
                enrolled:true,
                approval:4
            }
            
            if(studentinfo.currentSemester%2==0){
                createEnrollmentModel.semType="even"
            }else{
                createEnrollmentModel.semType="odd"
            }

            // since no collection will be created for new users
            // check whether details are available in enrollment collection
            const checkindbforenrollmen = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseDataforInternship._id})
                
                // update to new
                if(checkindbforenrollmen){
                    // checkindbforenrollmen = createEnrollmentModel
                    // checkindbforenrollmen.type = "internship"
                    // checkindbforenrollmen.studentId = studentinfo._id
                    // checkindbforenrollmen.courseCode = courseDataforInternship._id
                    // checkindbforenrollmen.branch = studentinfo.branch
                    // checkindbforenrollmen.semester = studentinfo.currentSemester
                    // checkindbforenrollmen.enrolled = true
                    if(checkindbforenrollmen.approval!=10){
                        // checkindbforenrollmen.approval = 4
                        registeredforinternship=false
                    }
                    if(checkindbforenrollmen.approval==10 && checkindbforenrollmen.semester==studentinfo.currentSemester){
                        registeredforinternship=true
                    }
                    // await checkindbforenrollmen.save()
                    // console.log("Exisiting enrollment collection for Internship has been updated to db")
                }
                else{
                    // create a new row in enrollment collection
                    const newenrollmentModel = new EnrollmentModel(createEnrollmentModel)
                    await newenrollmentModel.save()
                    console.log("new enrollment collection for internship is created")
                }
                
                // create a new value added collection
                const db_internship = await ValueAddedCourseModel.findOne({studentId:studentinfo._id,type:"internship"})
                if(!db_internship){
                const studentData = {
                    studentId:studentinfo._id,
                    semester:studentinfo.currentSemester,
                    type:"internship",
                    value:0
                }

                const result = new ValueAddedCourseModel(studentData)
                const getvalue = await result.save()
                console.log("new value added collection for internship is created")
                internship.push(getvalue.value)
                allowApplyForIntern = true
                
            // for an existing user send the available info
            }else{
    
                if(db_internship.value>6){
                    internship.push(db_internship.value)
                    allowApplyForIntern = false
                }else{
                    internship.push(db_internship.value)
                    allowApplyForIntern = true
                }
            }
        }else{
            console.log("The courseCode for internship is not available in curriculum")
        }
        

        // fetch activity points details
        const db_activityPoints = await ValueAddedCourseModel.findOne({studentId:studentinfo._id,type:"activityPoints"})

        // since no collection will be created for new users
        
        // check whether the coursecode for activity points is available in curriculum
        const courseData = await CurriculumModel.findOne({category:"activityPoints",regulation:studentinfo.regulation})
        
        if(courseData){
            const createEnrollmentModel = {
                type:"activityPoints",
                studentId:studentinfo._id,
                regulation:studentinfo.regulation,
                batch:studentinfo.batch,
                courseCode:courseData._id,
                courseCategory:courseDataforInternship.category,
                branch:studentinfo.branch,
                semester:studentinfo.currentSemester,
                enrolled:true,
                approval:4
            }
            
            if(studentinfo.currentSemester%2==0){
                createEnrollmentModel.semType="even"
            }else{
                createEnrollmentModel.semType="odd"
            }
            
            // check whether details are available in enrollment collection
            const checkindb = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseData._id})
            
            if(checkindb){
                // checkindb.type = "activityPoints"
                // checkindb.studentId = studentinfo._id
                // checkindb.courseCode = courseData._id
                // checkindb.branch = studentinfo.branch
                // checkindb.semester= studentinfo.currentSemester
                // checkindb.enrolled=true
                // checkindb.approval=4
                // console.log(checkindb)
                if(checkindb.approval!=10){
                    registeredforactivitypoints = false
                }
                if(checkindb.approval==10 && checkindb.semester == studentinfo.currentSemester){
                    registeredforactivitypoints = true
                }
                // await checkindb.save()
                // console.log("Exisiting enrollment collection for Activity points has been updated to db")
            }else{
                const newenrollmentModel = new EnrollmentModel(createEnrollmentModel)
                await newenrollmentModel.save()
                console.log("New enrollment collection for Activity points has been added to db")
            }
            
            if(!db_activityPoints){
                const studentData = {
                    studentId:studentinfo._id,
                    semester:studentinfo.currentSemester,
                    type:"activityPoints",
                    value:0
                }
                const result = new ValueAddedCourseModel(studentData)
                const getpoints = await result.save()
                
                console.log("New Value added for Activity points has been added to db")
                
                activityPoints.push(getpoints.value)
                allowApplyForActPoints = true
            }else{
                activityPoints.push(db_activityPoints.value)
                
                if((studentinfo.type == "regular"  || studentinfo.type == "transfer") && db_activityPoints.value<100){
                    allowApplyForActPoints = true
                }
                if(studentinfo.type == "lateral" && db_internship.value<75){
                    allowApplyForActPoints = true
                }
        
            }
        }else{
            console.log("The course code for activty points is not available for this students regulation")
        }

        res.status(200).json({success:true, msg:"Registration details are fetched",enrolledCourses, RACourses, SACourses, DroppedCourses, allowApplyForIntern, registeredforinternship, internship, registeredforactivitypoints, allowApplyForActPoints ,activityPoints})
        
    }else{
        res.status(200).json({success:false, msg:"Registration is not enabled, Can't send courses"})
    }

    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error})
    }
}


//save registration data to database
export const CR_Student_saveCourseRegisteration = async(req, res) => {
    try{
        let invalidCourse = [], invalidracourse=[], invalidsacourse=[],invalidDroppedcourse=[], invalidDroppingcourse=[]
        let message,messageforenrolledcourses,messageforracourses,messageforsacourses,messagefordroppededcourses,messagefordroppingcourses,success=false,messageforinternship, messageforactivitypoints, registeredForInternship, registeredForActivityPoints
        
        const coursesenrolled = {
            courseCode : req.body.enrolledCourses
        }

        const RACourses = {
            reappearCourse : req.body.RACourses
        }

        const SACourses = {
            reRegistrationCourse : req.body.SACourses
        }

        const DroppedCourses = {
            droppedCourse : req.body.droppedCourses
        }

        const DroppingCourses = {
            droppingCourse : req.body.droppingCourses
        }
       
        
        const intern = req.body.internship
        const actPoints = req.body.ActivityPoints
        
        // Fetch User details
        // const usermail = "abir.1918101@gct.ac.in"
        const usermail = "abiramee1128@gmail.com"
        const studentinfo = await StudentsModel.findOne({email:usermail})

        // const existing = await EnrollmentModel.find({studentId:studentinfo._id,semester:studentinfo.currentSemester})
        // for(let each of existing){
        //     const update = await EnrollmentModel.findOne({_id:each._id,type:{$in:["normal","dropped","RA","SA"]}})

        //     const courseinfo = await CurriculumModel.findOne({_id:each.courseCode})
        //     if(courseinfo.category=="PE" || courseinfo.category=="OE"){

        //     }
        //     update.semester=courseinfo.semester
        //     update.approval=4
        //     await update.save().then(p=>console.log(p))
        // }

        for(let eachcourse of coursesenrolled.courseCode){
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachcourse})
        
            if(courseincurriculummodel){
                let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                
                if(!enrollmentdata || enrollmentdata.enrolled==false){
                    success = false
                    // console.log(eachcourse)
                    invalidCourse.push(eachcourse)
                    messageforenrolledcourses = "You have not enrolled for these courses or these courses "+ eachcourse + " may not be approved"
                    console.log(messageforenrolledcourses)
                    // console.log(invalidCourse)
                }
                else{
                    success = true
                    // console.log(enrollmentdata)
                    messageforenrolledcourses = "Registration details (for enrolled Courses) "+ eachcourse + " were saved to database"
                    console.log(messageforenrolledcourses)
                    enrollmentdata.approval = 10
                    await enrollmentdata.save()
                }
            }
            else{
                invalidCourse.push(eachcourse)
                success = false
                messageforenrolledcourses = "These Course Code " +eachcourse+ " were not found in the database(Curriculum)"
                console.log(messageforenrolledcourses)
            }
        }

        for(let eachracourse of RACourses.reappearCourse){
            // console.log(eachracourse)
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachracourse})
        
            if(courseincurriculummodel){
                const db_RACourses = await ExternalsModel.find({studentId:studentinfo._id,courseCode:courseincurriculummodel._id,result:"RA"}).populate("courseId", {courseCode:1,title:1,_id:0})
                // console.log(db_RACourses)
                if(!db_RACourses){
                    success=false,
                    messageforracourses="This course code " +eachracourse+ " was not present in arrear collection for this student " + studentinfo.register
                    console.log(messageforracourses)
                    invalidracourse.push(eachracourse)
                }else{
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    // console.log(enrollmentdata)
                    if(!enrollmentdata){
                        success=false,
                        messageforracourses="It looks like you have not enrolled for this RA course" + eachracourse
                        console.log(messageforracourses)
                        invalidracourse.push(eachracourse)
                    }else{
                        success = true
                        messageforracourses = "Registration details (For RA Course) "+ eachracourse+ " were saved to database"
                        console.log(messageforracourses)
                        enrollmentdata.type="RA"
                        enrollmentdata.semester = studentinfo.currentSemester
                        enrollmentdata.approval = 10
                       await enrollmentdata.save()
                        // console.log(ress)
                    }
                }
               
            }
            else{
                invalidCourse.push(eachracourse)
                success = false
                messageforracourses = "These Course Codes were not found in the database(Curriculum)"
                console.log(messageforracourses)
            }

        }
        
        for(let eachsacourse of SACourses.reRegistrationCourse){
            // console.log(eachsacourse)
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachsacourse})
        
            if(courseincurriculummodel){
                const db_SACourses = await ExternalsModel.find({studentId:studentinfo._id,courseCode:courseincurriculummodel._id,result:"SA"}).populate("courseId", {courseCode:1,title:1,_id:0})
                // console.log(db_SACourses)
                if(!db_SACourses){
                    success=false,
                    messageforsacourses="This course code " +eachsacourse+ " was not present in arrear collection for this student "+studentinfo.register
                    console.log(messageforsacourses)
                    invalidsacourse.push(eachsacourse)
                }else{
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    // console.log(enrollmentdata)
                    if(!enrollmentdata){
                        success=false,
                        messageforsacourses="It looks like you have not enrolled for this SA course "+eachsacourse
                        console.log(messageforsacourses)
                        invalidsacourse.push(eachsacourse)
                    }else{
                        enrollmentdata.type="SA"
                        enrollmentdata.semester = studentinfo.currentSemester
                        enrollmentdata.approval = 10
                        await enrollmentdata.save()
                        success = true
                        messageforsacourses = "Registration details  (for SA Course) "+eachsacourse+ " were saved to database"
                        console.log(messageforsacourses)
                    }
                } 
            }
            else{
                invalidsacourse.push(eachsacourse)
                success = false
                messageforsacourses = "These Course Code "+eachsacourse +" were not found in the database(Curriculum)"
            }
        }

        for(let eachdroppingcourse of DroppingCourses.droppingCourse){
            // console.log(eachdroppingcourse)
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachdroppingcourse})
        
            if(courseincurriculummodel){
                const db_DroppingCourses = await EnrollmentModel.find({studentId:studentinfo._id,courseCode:courseincurriculummodel._id}).populate("courseCode", {courseCode:1,title:1,_id:0})
                // console.log(db_RACourses)
                if(!db_DroppingCourses){
                    success=false,
                    messagefordroppingcourses="The dropping course code" +eachdroppingcourse+ " was not present in enrollment collection for the student" + studentinfo.register
                    console.log(messagefordroppingcourses)
                    invalidDroppingcourse.push(eachdroppingcourse)
                }else{
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    // console.log(enrollmentdata)
                    if(!enrollmentdata){
                        success=false,
                        messagefordroppingcourses="It looks like you have not enrolled for this course"
                        console.log(messagefordroppingcourses)
                        invalidDroppingcourse.push(eachdroppingcourse)
                    }else{
                        success = true
                        messagefordroppingcourses = "Registration details (for Dropping Course)"+ eachdroppingcourse+ " were saved to database"
                        console.log(messagefordroppingcourses)
                        enrollmentdata.type="dropped"
                        enrollmentdata.semester = studentinfo.currentSemester
                        enrollmentdata.approval = 4
                        await enrollmentdata.save()
                    }
                } 
            }
            else{
                invalidDroppingcourse.push(eachdroppingcourse)
                success = false
                messagefordroppingcourses = "These Course Code" + eachdroppingcourse+ " were not found in the database(Curriculum)"
                console.log(messagefordroppingcourses)
            }

        }

        for(let eachdroppedcourse of DroppedCourses.droppedCourse){
            // console.log(eachracourse)
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachdroppedcourse})
        
            if(courseincurriculummodel){
                const db_DroppedCourses = await EnrollmentModel.find({studentId:studentinfo._id,courseCode:courseincurriculummodel._id,type:"dropped"}).populate("courseCode", {courseCode:1,title:1,_id:0})
                // console.log(db_RACourses)
                if(!db_DroppedCourses){
                    success=false,
                    messagefordroppededcourses="The dropped course code" +eachdroppedcourse+ " was not present in enrollment collection for the student" + studentinfo.register
                    invalidDroppedcourse.push(eachdroppedcourse)
                }else{
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    // console.log(enrollmentdata)
                    if(!enrollmentdata){
                        success=false,
                        messagefordroppededcourses="It looks like you have not enrolled for this course"
                        console.log(messagefordroppededcourses)
                        invalidDroppedcourse.push(eachdroppedcourse)
                    }else{
                        success = true
                        messagefordroppededcourses = "Registration details (for Dropped Course) were saved to database"
                        console.log(messagefordroppededcourses)
                            
                        enrollmentdata.type="dropped"
                        
                        enrollmentdata.semester = studentinfo.currentSemester
                        enrollmentdata.approval = 10
                        await enrollmentdata.save()
                    }
                } 
            }
            else{
                invalidDroppedcourse.push(eachdroppedcourse)
                success = false
                messagefordroppededcourses = "These Course Codes were not found in the database(Curriculum)"
                console.log(messagefordroppededcourses)
            }

        }



        if(intern){
            const db_internship = await ValueAddedCourseModel.findOne({studentId:studentinfo._id,type:"internship"})
            
            let flag=false
            if((studentinfo.type == "regular"  || studentinfo.type == "transfer") && db_internship.value<6){
                // allowApplyForActPoints = true
                flag = true
                // message = "student registered for internship"
            }

            if(flag){
                const courseincurriculummodel = await CurriculumModel.findOne({category:"internship",regulation:studentinfo.regulation})
                
                if(courseincurriculummodel){
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    
                    if(enrollmentdata){
                        // if(enrollmentdata.enrolled==false || enrollmentdata.approval!=10){
                        // success = false
                        // registeredForInternship = false
                        // console.log("The internship for this student does not have proper data in the enollment collections")
                        // }else{
                            success = true
                            registeredForInternship = true
                            messageforinternship = "Registration details (for Internship) were saved to database"
                            console.log(messageforinternship)
                            enrollmentdata.semester = studentinfo.currentSemester
                            if(studentinfo.currentSemester%2==0){
                                enrollmentdata.semType="even"
                            }else{
                                enrollmentdata.semType="odd"
                            }
                            enrollmentdata.approval = 10
                            await enrollmentdata.save()
                        // }
                    }else{
                        console.log("The internship for this student is not found in the enollment collections")
                    }
                }else{
                    registeredForInternship = false
                    messageforinternship = "The Internship for your regulation is not found in curriculum(No course Code for internship type)"
                    console.log(messageforinternship)
                }
                
            }else{
                registeredForInternship = false
                console.log("Student unable to register for Internships because the student may already met his requirements(i.e -> intern credits > 6)")
            
            }
        }else{
            
            const courseincurriculummodel = await CurriculumModel.findOne({category:"internship",regulation:studentinfo.regulation})
                
            if(courseincurriculummodel){
                let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                
                if(enrollmentdata){
                    
                    success = true
                    registeredForInternship = false
                    messageforinternship = "Registration details (for Internship) were saved to database  - Deregistered" 
                    console.log(messageforinternship)
                    
                    enrollmentdata.approval = 4
                    await enrollmentdata.save()
                
                }else{
                    console.log("The internship for this student is not found in the enollment collections")
                }
            }else{
                registeredForInternship = false
                messageforinternship = "The Internship for your regulation is not found in curriculum(No course Code for internship type)"
                console.log(messageforinternship)
            }
                
        }

        if(actPoints){
            const db_activityPoints = await ValueAddedCourseModel.findOne({studentId:studentinfo._id,type:"activityPoints"})
           
            let flag=false
            if((studentinfo.type == "regular"  || studentinfo.type == "transfer") && db_activityPoints.value<100){
                // allowApplyForActPoints = true
                flag = true
                // message = "student registered for internship"
            }else if(studentinfo.type == "lateral" && db_internship.value<75){
                // allowApplyForActPoints = true
                flag = true
            }
            
            if(flag){
                const courseincurriculummodel = await CurriculumModel.findOne({category:"activityPoints",regulation:studentinfo.regulation})
                if(courseincurriculummodel){
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    
                    if(enrollmentdata){
                            success = true
                            registeredForActivityPoints = true
                            messageforactivitypoints = "Registration details (for Activity Points) were saved to database"
                            console.log(messageforactivitypoints)
                            enrollmentdata.semester = studentinfo.currentSemester
                            if(studentinfo.currentSemester%2==0){
                                enrollmentdata.semType="even"
                            }else{
                                enrollmentdata.semType="odd"
                            }
                            enrollmentdata.approval = 10
                            await enrollmentdata.save()
                    
                    }else{
                        console.log("The Activity Points for this student is not found in the enollment collections")
                    }
                }else{
                    registeredForActivityPoints = false
                    messageforactivitypoints = "The Activity Points for your regulation is not found in curriculum(No course Code for internship type)"
                    console.log(messageforactivitypoints)
                }
            }else{
                // message="Student unable to register for Activity Points"
                registeredForActivityPoints = false
                console.log("Student unable to register for Activity Points because the student may already met his requirements(i.e -> activityPoints> 100||75)")
            }
        }else{
            const courseincurriculummodel = await CurriculumModel.findOne({category:"activityPoints",regulation:studentinfo.regulation})
                if(courseincurriculummodel){
                    let enrollmentdata = await EnrollmentModel.findOne({studentId:studentinfo._id,courseCode:courseincurriculummodel._id})
                    
                    if(enrollmentdata){
                            success = true
                            registeredForActivityPoints = false
                            messageforactivitypoints = "Registration details (for Activity Points) were saved to database - Deregistered"
                            console.log(messageforactivitypoints)
                            enrollmentdata.approval = 4
                            await enrollmentdata.save()
                    
                    }else{
                        console.log("The Activity Points for this student is not found in the enollment collections")
                    }
                }else{
                    registeredForActivityPoints = false
                    message = "The Activity Points for your regulation is not found in curriculum(No course Code for internship type)"
                    console.log(message)
                }
        }

        res.status(200).json({success:success, message:message,messageforenrolledcourses, invalidCourse, messageforracourses, invalidracourse, messageforsacourses, invalidsacourse, messagefordroppingcourses, invalidDroppingcourse, messagefordroppededcourses, invalidDroppedcourse, registeredForActivityPoints,registeredForInternship})
        
     
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}




/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



/////////////////////// REQUEST MODULE ///////////////////////
export const profileRequest = async (req, res) => {

    try {

        let request = req.body

        await RequestsModel.create(request)

        res.status(200).send("Requested successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}


/////////////////////// PROFILE ///////////////////////
export const getProfile = async (req, res) => {

    try {

        let { studentId } = req.query

        //Get the student details 
        let profile = await StudentDetailsModel.find({ studentId: studentId }, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).populate("studentId", { __v: 0, createdAt: 0, updatedAt: 0 })
        profile = { ...profile[0].studentId.toObject(), ...profile[0].toObject() }

        delete profile.studentId

        //checking whether the student has made any request
        let isRequestMade = await RequestsModel.find({ from: studentId }, { done: 1 }).sort({createdAt: 'desc'})

        //storing whether the student can mske request or not
        profile.canRequest = (isRequestMade[0].done) ? true : false

        //find the fa and hod for the student 
        let staff = await FacultyModel.find({ branch: profile.branch, fa: true }, { _id: 1, fa: 1 })
        //storing the fa and hod 
        profile.toId = staff[0]._id 

        res.status(200).json(profile)

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }

}