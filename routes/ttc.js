import express from "express"
import { getCurriculum, getElectives } from "../controllers/AdminController.js";

import { getdailyjob, getGroups, getStaff, getTimetable, getUt, postGroups, postStaff, postTimetable } from "../controllers/TTCController.js"

const router = express.Router()

///////////////////////  ADMIN MODULE ///////////////////////
router.get("/electives", getElectives)


///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



///////////////////////  FACULTY MODULE ///////////////////////



/////////////////////// CURRICULUM MODULE ///////////////////////
router.get("/curriculum", getCurriculum)



/////////////////////// TIMETABLE MODULE ///////////////////////

//router.get("/demo", getDemo);
router.get("/staff", getStaff);
router.post("/staff", postStaff);
router.get("/timetable", getTimetable);
router.post("/timetable", postTimetable);
router.get("/ut", getUt);
router.get("/groups", getGroups);
router.post("/groups",postGroups);
router.get("/dailyjob", getdailyjob)

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



export default router