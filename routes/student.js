import express from "express"
<<<<<<< HEAD
import { getCurriculum, getElectives } from "../controllers/AdminController.js"

import { CE_Student_checkforenrolment, CE_Student_getenrolmentdata, CE_Student_saveenrolmentdata, CR_Student_checkforregistration, CR_Student_getregisterdata, CR_Student_saveCourseRegisteration, Result_Student_Result } from "../controllers/StudentController.js"
=======
import { getBranchCache, getCurriculum, getElectives } from "../controllers/AdminController.js"
import { demo, getMasterTimetable, getTimetable, getProfile, profileRequest } from "../controllers/StudentController.js"
>>>>>>> 3c3de1a70bc670858a07338b00b0efd21a5a323d

const router = express.Router()


///////////////////////  CACHE ///////////////////////
router.get("/branch/cache", getBranchCache)


///////////////////////  ADMIN MODULE ///////////////////////
router.get("/electives", getElectives)


///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////
router.get("/curriculum", getCurriculum)



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////
router.get("/demo", demo)
router.get("/timetable", getTimetable)
router.get("/masterTimetable", getMasterTimetable)


/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////

router.route("/enrolment").get(CE_Student_checkforenrolment)

router.route("/enrolment/getdata").get(CE_Student_getenrolmentdata)

router.route("/enrolment/savedata").post(CE_Student_saveenrolmentdata)




/////////////////////// RESULT MODULE ///////////////////////

router.route("/result").get(Result_Student_Result)


/////////////////////// REGISTRATION MODULE ///////////////////////

router.route("/courseregistration").get(CR_Student_checkforregistration)

router.route("/courseregistration/getdata").get(CR_Student_getregisterdata)

router.route("/courseregistration/savedata").post(CR_Student_saveCourseRegisteration)



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////
router.post("/profile/request", profileRequest)


/////////////////////// PROFILE ////////////////////////
router.get("/profile", getProfile)

export default router