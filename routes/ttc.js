import express from "express"
import { getBatch, getBranchCache, getCurriculum, getElectives, getRegulation } from "../controllers/AdminController.js";

import { getdailyjob, getGroups, getStaff, getTimetable, getUt, postGroups, postStaff, postTimetable, getProfile, profileRequest } from "../controllers/TTCController.js"

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



/////////////////////// PROFILE ////////////////////////
router.get("/profile", getProfile)


/////////////////////// REQUEST MODULE ///////////////////////
router.post("/profile/request", profileRequest)

export default router