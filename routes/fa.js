import express from "express"

import { getCurriculum, getElectives } from "../controllers/AdminController.js"

import { enrollment_FA_ApproveStudents, enrollment_FA_GetEnrolledStudentsList, getAttendance, getAttendanceReport, postAttendance } from "../controllers/FAController.js"

const router = express.Router()

///////////////////////  ADMIN MODULE ///////////////////////
router.get("/electives", getElectives)



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////
router.get("/curriculum", getCurriculum)



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////

router.get("/attendance",getAttendance)
router.post("attendance", postAttendance)
router.get("/attendanceReport", getAttendanceReport)

/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////
router.route('/enrolment').get(enrollment_FA_GetEnrolledStudentsList)

router.route('/enrolment/approvestudents').post(enrollment_FA_ApproveStudents)



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



export default router