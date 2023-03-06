import { AttendanceModel } from "../models/AttendanceModel.js";
import { CourseDetailsModel } from "../models/CourseDetailsModel.js";
import { CurriculumModel } from "../models/CurriculumModel.js";
import { EnrollmentModel } from "../models/EnrollmentModel.js";
import { FacultyModel } from "../models/FacultyModel.js";
import { MasterTimetableModel } from "../models/MasterTimetableModel.js";


///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////

export const demo = async (req,res) => {

    try{
        await AttendanceModel.deleteMany({masterTimetableId:"63faea970fbbb6e187cba951"})
        res.status(200).send("Success")
    } catch(err) { res.status(400).send("Failed: " + err.message); }
}

//Completed
export const getTimetable = async (req,res) => {

    try{

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
            if (course.courseId.newSchedule!=null){

                course.effectiveDate = course.courseId.newSchedule.effectiveDate
                course.schedule = course.courseId.newSchedule.schedule
    
            } else{ 
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
        
    } catch(err) { res.status(400).send("Failed: " + err.message); }

}


//Completed
export const getMasterTimetable = async (req,res) => {

    try{

        let { studentId, semester }  = req.query

        //Fetch all courses of this semester
        let data = await EnrollmentModel.find({studentId:studentId, semester:semester}, {courseId:1}).populate("courseCode", {title:1, courseCode:1})
        data = data.map(course => course.toObject())
        let result = []

        //Iterate over each course
        for(let course of data){
            
            //Get All Periods of the course from mastertimetable
            let periods  = await MasterTimetableModel.find({courseId:course.courseId}, {_id:1, date:1, period:1, marked:1, dayOrder:1}).sort({date:1, period:1})
            periods = periods.map( period => period.toObject() )
            
            //Iterate over each period
            for(let period of periods){
                console.log(period.date, period.period, period.dayOrder)
                //Check if attendance marked
                if(period.marked == true){
                    
                    let attendance = await AttendanceModel.find({studentId:studentId, masterTimetableId:period._id}, {present:1, onduty:1})
                    period.present = attendance[0].present
                    period.onduty = attendance[0].onduty
                
                }

                //Regularize data for front-end
                period.courseName = course.courseCode.title
                period.courseCode = course.courseCode.courseCode
                
                result.push({...period})
            }

        }
        console.log("Data Sent")
        res.status(200).json(result)

    } catch(err) { res.status(400).send("Failed: " + err.message); }

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


