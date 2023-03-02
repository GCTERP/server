import express from "express"
import { getBranchCache, getCurriculum, getElectives } from "../controllers/AdminController.js"
import { demo, getMasterTimetable, getTimetable, getProfile, profileRequest } from "../controllers/StudentController.js"

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



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



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