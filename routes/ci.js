import express from "express"
import { getBatch, getBranchCache, getCurriculum, getElectives, getRegulation } from "../controllers/AdminController.js"


import { demo, dropPeriod, getAttendance, getAttendancePercent, getCourses, getMasterAttendance, getProfile, getStaffTimetable, getStudentTimetable, postAttendance, profileRequest } from "../controllers/CIController.js"

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

router.get("/masterAttendance", getMasterAttendance);
router.get("/attendance", getAttendance);
router.post("/attendance", postAttendance);
router.get("/dropPeriod", dropPeriod);
router.get("/courses", getCourses);
router.get("/attendancePercent", getAttendancePercent);
router.get("/staffTimetable", getStaffTimetable);
router.get("/studentTimetable", getStudentTimetable);   
router.get("/demo", demo);

/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////


/////////////////////// PROFILE ///////////////////////
router.get("/profile", getProfile)


/////////////////////// REQUEST MODULE ///////////////////////
router.post("/profile/request", profileRequest)

export default router