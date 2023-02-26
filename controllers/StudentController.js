import { SemesterMetadataModel } from '../models/SemesterMetadataModel.js'
import { ElectiveMetadataModel } from '../models/ElectiveMetadataModel.js'
import { EnrollmentModel } from '../models/EnrollmentModel.js'
import { CurriculumModel } from '../models/CurriculumModel.js'
import { StudentsModel } from '../models/StudentsModel.js'

///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////


// check for enrolment status
export const enrollment_Student_CheckforEnrollment = async(req, res) => {
    try{
        const studentmail = "mano.1917130@gct.ac.in"
        const studentinfo = await StudentsModel.findOne({email:studentmail})
       
        const enrollmentstatus = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester, batch:studentinfo.batch}})
        
        if(enrollmentstatus.enrollment.status == 'Active'){
            res.status(200).json({success:true, msg:"Enrollment is enabled"})
        }else{
            res.status(200).json({success:false, msg:"Enrollment is not enabled"})
        }
        
    }catch(error){
        console.log(error);
        res.status(400).json({success:false,message:"Something wrong happened",Error:error});
    }
}

// fetch data to feed the enrollment page 
export const enrollment_Student_GetEnrollmentData = async(req, res) => {
    try{
        const studentmail = "mano.1917130@gct.ac.in"
        const studentinfo = await StudentsModel.findOne({studentmail})
      
        const enrollmentstatus = await SemesterMetadataModel.findOne({semester:{sem:studentinfo.currentSemester,batch:studentinfo.batch}})
        
        if(enrollmentstatus.enrollment.status == 'Active'){
            
            const mandatorycourses = await CurriculumModel.find({semester:studentinfo.currentSemester,branch:studentinfo.branch})
            const allowedelectivecourses = await ElectiveMetadataModel.findOne({regulation:studentinfo.regulation,branch:studentinfo.branch,semester:studentinfo.currentSemester})
           
            const pecourses = await CurriculumModel.find({branch:studentinfo.branch,category:"PE"})
            const oecourses = await CurriculumModel.find({category:"OE"})
            let addonallowed
            // This might be changed, suggest => Get this value predefault in regulation/curriculum
            if(studentinfo.currentSemester>=5){
                addonallowed = true
            }
            
            res.status(200).json({success:true, msg:"Enrollment details are fetched",Semester:studentinfo.currentSemester,oecountallowed:allowedelectivecourses.oe,pecountallowed:allowedelectivecourses.pe,addonallowed,courses:{mandatorycourses,pecourses,oecourses}})
            
        }else{
            res.status(200).json({success:false, msg:"Enrollment is not enabled, Can't send courses"})
        }

    }catch(error){
        console.log(error)
        res.status(400).json({success:false,message:"Something wrong happened",Error:error})
    }
}



// save the user enrolled course to the database
export const enrollment_Student_SaveEnrolmentData = async(req, res) => {
    try{
   
        const coursesenrolled = {
            courseCode : req.body.courses
        }
        const enrollmentdata = {
            enrolled : false,
            approval : 0
        }
        
        console.log(coursesenrolled.courseCode)
        
        // Fetch User details
        const usermail = "mano.1917130@gct.ac.in"
        const studentinfo = await StudentsModel.findOne({email:usermail})
       
        enrollmentdata.studentId = studentinfo._id
        enrollmentdata.semester = studentinfo.currentSemester
        enrollmentdata.branch = studentinfo.branch

        EnrollmentModel.deleteMany({studentId:studentinfo._id,approval:0}).then(p=>console.log(p))
            
        coursesenrolled.courseCode.forEach(savetodb);
        async function savetodb(eachcourse) {
            const courseincurriculummodel = await CurriculumModel.findOne({courseCode:eachcourse})
            enrollmentdata.courseCode = courseincurriculummodel._id
    
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



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////


