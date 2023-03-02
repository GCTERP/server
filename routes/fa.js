import express from "express"

import { getBatch, getBranchCache, getCurriculum, getElectives, getRegulation } from "../controllers/AdminController.js"

import { demo, getAttendance, getAttendanceReport, getProfile, getRequests, postAttendance, profileRequest, updateStudentProfile } from "../controllers/FAController.js"

const router = express.Router()


///////////////////////  CACHE ///////////////////////

// Batch cache
router.get("/batch", getBatch)

router.get("/branch/cache", getBranchCache)

router.get("/regulation", getRegulation)


///////////////////////  ADMIN MODULE ///////////////////////
router.get("/electives", getElectives)



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////
router.get("/curriculum", getCurriculum)



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////

router.get("/demo",demo)
router.get("/attendance",getAttendance)
router.post("/attendance", postAttendance)
router.get("/attendanceReport", getAttendanceReport)

/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////


/////////////////////// PROFILE ////////////////////////
router.get("/profile", getProfile)

/////////////////////// REQUEST ///////////////////////
router.get("/requests", getRequests)

router.post("/requests/student/update", updateStudentProfile)

router.post("/profile/request", profileRequest)



export default router